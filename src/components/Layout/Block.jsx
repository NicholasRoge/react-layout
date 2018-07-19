import PropTypes from 'prop-types'
import React from 'react'

import Layout from '../Layout'
import { isDeepStrictEqual } from 'util';


const apiMethod = (target, name, descriptor) => {
    if (typeof descriptor.value === 'function') {
        const apiMethodNames = target.apiMethodNames || []
        apiMethodNames.push(name)
        target.apiMethodNames = apiMethodNames
    }

    return descriptor
}


class Something {
    _updates = {
        appends: [],
        prepends: [],
        decorators: []
    }

    append(element) {
        this._updates.appends.push(element)
    }

    prepend(element) {
        this._updates.prepends.push(element)
    }

    decorate(decorator) {
        this._updates.decorators.push(decorator)
    }

    getUpdates(type) {
        return this._updates[type]
    }
}

class Block extends React.Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        renderer: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func
        ]),
        rendererProps: PropTypes.object,
        references: PropTypes.array
    }

    static defaultProps = {
        renderer: ({children}) => children,
        rendererProps: {},
        references: []
    }


    renderTransport = null


    constructor() {
        super(...arguments)

        this.apiMethods = {}
        for (const name of this.apiMethodNames) {
            this.apiMethods[name] = this[name].bind(this)
        }

        this.state = {
            updates: {
                appends: {
                    all: {},
                    before: [],
                    content: [],
                    after: []
                },
                prepends: {
                    all: {},
                    before: [],
                    content: [],
                    after: []
                },
                decorators: {
                    all: {},
                    before: [],
                    content: [],
                    after: []
                }
            }
        }
    }

    render() {
        const {
            name,
            renderer: Renderer,
            rendererProps,
            children
        } = this.props

        //console.log([...(this.renderedReferences || [])])
        this.renderedReferences = new Set()
        //console.log(this.state.updates.decorators.all)

        return this.renderDecorated(
            <div className="layout-block" data-name={name}>
                <div>Block: {name}</div>

                <main>
                    {this.renderPrepends()}
                    <Renderer {...rendererProps}>
                        {children}
                    </Renderer>
                    {this.renderAppends()}
                </main>
            </div>
        )
    }

    renderAppends() {
        return this.renderUpdates('appends')
    }

    renderPrepends() {
        return this.renderUpdates('prepends')
    }

    renderDecorated(base) {
        return this.renderUpdates('decorators')
            .reduce((prev, decorator) => decorator(prev), base)
    }


    renderUpdates(type) {
        const typeUpdates = this.state.updates[type]


        const contentUpdates = [
            ...typeUpdates.before
                .map(id => this.flattenNode(id, typeUpdates.all))
                .reduce((prev, current) => prev.concat(current), []),
            ...typeUpdates.content
                .map(id => this.flattenNode(id, typeUpdates.all))
                .reduce((prev, current) => prev.concat(current), []),
            ...typeUpdates.after
                .map(id => this.flattenNode(id, typeUpdates.all))
                .reduce((prev, current) => prev.concat(current), [])
        ]

        return contentUpdates
    }

    flattenNode(id, all) {
        return [
            ...all[id].before
                .map(beforeId => this.flattenNode(beforeId, all))
                .reduce((prev, current) => prev.concat(current), []),
            ...all[id].content,
            ...all[id].after
                .map(beforeId => this.flattenNode(beforeId, all))
                .reduce((prev, current) => prev.concat(current), [])
        ]
    }


    componentDidMount() {
        console.log(`Block[name="${this.props.name}"]:  componentDidMount`)

        this.setState({
            block: this.props.layout.createBlock(this.props.name, this.apiMethods)
        })
    }

    componentDidUpdate(prevProps) {
        console.log(`Block[name="${this.props.name}"]:  componentDidUpdate`)

        if (this.props.name !== prevProps.name) {
            this.state.block.destroy()
            this.setState({
                block: this.props.layout.createBlock(this.props.name, this.apiMethods)
            })
        }
    }

    componentWillUnmount() {
        console.log(`Block[name="${this.props.name}"]:  componentWillUnmount`)

        if (this.state.block) {
            this.state.block.destroy()
        }
    }


    @apiMethod
    renderReference(id, callback, options) {
        const something = new Something()
        callback(something)

        for (const type in this.state.updates) {
            const typeUpdates = {...this.state.updates[type]}

            if (typeUpdates.all[id]) {
                typeUpdates.all[id].content = something.getUpdates(type)
            } else {
                typeUpdates.all[id] = {
                    before: [],
                    content: something.getUpdates(type),
                    after: [],

                    position: null
                }
            }

            if (options.before) {
                if (options.before === true || options.before === '-') {
                    typeUpdates.all[id].position = ['before', null]

                    typeUpdates.before.push(...something[type])
                } else {
                    typeUpdates.all[id].position = ['before', options.before]
                    if (typeUpdates.all[options.before]) {
                        if (!typeUpdates.all[options.before].before.includes(id)) {
                            typeUpdates.all[options.before].before.push(id)
                        }
                    } else {
                        typeUpdates.all[options.before] = {
                            before: [id],
                            content: [],
                            after: [],
                            
                            position: null
                        }
                    }
                }
            } else if (options.after) {
                if (options.after === true || options.after === '-') {
                    typeUpdates.all[id].position = ['after', null]

                    typeUpdates.after.push(id)
                } else {
                    typeUpdates.all[id].position = ['after', options.after]

                    if (typeUpdates.all[options.after]) {
                        if (!typeUpdates.all[options.after].after.includes(id)) {
                            typeUpdates.all[options.after].after.push(id)
                        }
                    } else {
                        typeUpdates.all[options.after] = {
                            before: [],
                            content: [],
                            after: [id],

                            position: null
                        }
                    }
                }
            } else {
                if (!typeUpdates.content.includes(id)) {
                    typeUpdates.content.push(id)
                }
            }

            this.setState(() => ({
                updates: {
                    ...this.state.updates,
                    [type]: typeUpdates
                }
            }))
        }

        this.renderedReferences.add("+" + id + "(" + this.renderedReferences.size + ")")

        return 
    }

    @apiMethod
    destroyReference(id) {
        this.setState((prevState) => {
            this.renderedReferences.add("-" + id + "(" + this.renderedReferences.size + ")")

            const updates = {...prevState.updates}
            for (const type in updates) {
                const referenceUpdates = updates[type].all[id]
                if (!referenceUpdates) {
                    continue
                }

                
                if (referenceUpdates.position) {
                    if (referenceUpdates.position[1]) {
                        const index = updates[type].all[referenceUpdates.position[1]][referenceUpdates.position[0]].indexOf(id)
                        updates[type].all[referenceUpdates.position[1]][referenceUpdates.position[0]].splice(index, 1)
                    } else {
                        const index = updates[type][referenceUpdates.position[0]].indexOf(id)
                        updates[type][referenceUpdates.position[0]].splice(index, 1)
                    }
                } else {
                    const index = updates[type].content.indexOf(id)
                    updates[type].content.splice(index, 1)
                }
            }

            return {
                updates
            }
        })
    }
}


export default (props) => (
    <Layout.Consumer>
        {layout => <Block {...props} layout={layout} />}
    </Layout.Consumer>
)