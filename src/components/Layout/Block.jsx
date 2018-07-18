import PropTypes from 'prop-types'
import React from 'react'

import Layout from '../Layout'
import { appendFile } from 'fs';
import { prependListener } from 'cluster';


const apiMethod = (target, name, descriptor) => {
    if (typeof descriptor.value === 'function') {
        const apiMethodNames = target.apiMethodNames || []
        apiMethodNames.push(name)
        target.apiMethodNames = apiMethodNames
    }

    return descriptor
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


    render
    renderTransport = null


    constructor() {
        super(...arguments)

        this.apiMethods = {}
        for (const name of this.apiMethodNames) {
            this.apiMethods[name] = this[name].bind(this)
        }

        this.createReference = this.createReference.bind(this)
    }

    render() {
        const {
            name,
            renderer: Renderer,
            rendererProps,
            references
        } = this.props

        const children = this.renderChildren(this.props.children)



        const renderedBlock = (
            <div className="layout-block" data-name={name}>
                <div>Block: {name}</div>

                <main>
                    <Renderer {...rendererProps}>
                        {this.renderPrepends()}
                        {children}
                        {this.renderAppends()}
                    </Renderer>
                </main>
            </div>
        )

        return this.renderDecorated(renderedBlock)
    }

    renderAppends() {
        return this.renderContentUpdates('appends', this.state.updates.appends, this.state.updates.appends.all)
    }

    renderPrepends() {
        return this.renderContentUpdates('prepends', this.state.updates.prepends, this.state.updates.prepends.all)
    }

    renderContentUpdates(id, {before, core, after}, all) {
        const contentUpdates = []

        if (before.length > 0) {
            contentUpdates.push(
                <React.Fragment key={`${id}.before`}>
                    {before.map(updateId => this.renderContentUpdates(updateId, all[updateId], all))}
                </React.Fragment>
            )
        }
        if (core) {
            contentUpdates.push(
                <React.Fragment key={`${id}.core`}>
                    {core}
                </React.Fragment>
            )
        }
        if (after.length > 0) {
            contentUpdates.push(
                <React.Fragment key={`${id}.before`}>
                    {before.map(updateId => this.renderContentUpdates(updateId, all[updateId], all))}
                </React.Fragment>
            )
        }

        return contentUpdates
    }

    renderDecorated(base) {
        return base
    }


    componentDidMount() {
        this.setState({
            block: layout.createBlock(this.name, this.createReference)
        })
    }

    componentDidUpdate(prevProps) {
        if (this.props.name !== prevProps.name) {
            this.state.block.destroy()
            this.setState({
                block: layout.createBlock(this.name, this.apiMethods)
            })
        }
    }

    componentWillUnmount() {
        if (this.state.block) {
            this.state.block.destroy()
        }
    }


    renderReference(id, callback, options) {
        const accumulator = new UpdateAccumulator()
        callback(accumulator)

        for (const type in this.state.updates) {
            if (reference.updates[type].length === 0) {
                continue
            }


            const typeUpdates = this.state.updates[type]

            if (options.before) {
                if (options.before === true || options.before === '-') {
                    typeUpdates.before.push(...accumulator[type])
                } else {

                }
            } else if (options.after) {

            } else {

            }
            
            if (!typeUpdates.all[id]) {
                typeUpdates.all[id] = {
                    before: [],
                    core: null,
                    after: []
                }
            }
            typeUpdates.all[id] = accumulator[type].

            this.setState(() => ({
                updates: {
                    ...this.state.updates,
                    [type]: typeUpdates
                }
            }))
        }

        this.setState(() => ({
            references: {
                ...this.state.references,
                [id]: reference
            }
        }))
        return 
    }

    destroyReference(id) {

    }

    @apiMethod
    resetUpdates() {
        this.setState({
            updates: {
                prepends: {},
                appends: {},
                decorators: {}
            }
        })
    }

    @apiMethod 
    append(element) {

    }

    @apiMethod
    prepend(element) {

    }
}


export default (props) => (
    <Layout.Consumer>
        {layout => <Block {...props} layout={layout} />}
    </Layout.Consumer>
)