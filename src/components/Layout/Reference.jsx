import PropTypes from 'prop-types'
import React from 'react'
import uuidv4 from 'uuid/v4'

import Layout from '../Layout'
import {parentBlockContext} from './Block.jsx'



const recursiveDecoratorContext = React.createContext({})

class Reference extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        id: PropTypes.string,
        children: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.func
        ]),

        before: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]),
        after: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ])
    }

    static defaultProps = {
        recursivelyDecorated: false
    }

    static getDerivedStateFromProps(props, state) {
        return {
            id: props.id || state.anonId
        }
    }

    _recursivelyDecorated = false

    constructor() {
        super(...arguments)

        this.state = {
            id: null,
            anonId: uuidv4()
        }
    }

    render() {
        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  render`)

        return (
            <div className="layout-reference">
                <div>Reference '{this.state.id}' references '{this.props.name}'</div>
            </div>
        )
    }

    renderReference() {
        const {
            name,
            block,
            children,
            parentBlocks,
            ...options
        } = this.props

        if (!block || !children) {
            return
        }

        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  renderReference`)


        let baseCallback
        if (children instanceof Function) {
            baseCallback = children
        } else {
            baseCallback = block => block.append(children)
        }

        let recursionDetectingCallback = baseCallback
        if (parentBlocks.includes(name)) {
            recursionDetectingCallback = block => {
                ((oldFn) => {
                    block.decorate = (decorator) => {
                        if (!this.props.id) {
                            throw new Error("References that decorate a block in the parent context MUST have an ID to prevent recursion.")
                        }

                        if (!this._recursivelyDecorated) {
                            oldFn.apply(block, [prev => (
                                <recursiveDecoratorContext.Consumer>
                                    {recursiveDecorators => {
                                        const nextRecursiveDecorators = {...recursiveDecorators}
                                        nextRecursiveDecorators[name] = [
                                            ...(nextRecursiveDecorators[name] || []),
                                            this.props.id
                                        ]

                                        return (
                                            <recursiveDecoratorContext.Provider value={nextRecursiveDecorators}>
                                                {prev}
                                            </recursiveDecoratorContext.Provider>
                                        )
                                    }}
                                </recursiveDecoratorContext.Consumer>
                            )])

                            this._recursivelyDecorated = true
                        }

                        oldFn.apply(block, [decorator])
                    }
                })(block.decorate)

                baseCallback(block)
            }
        }

        block.renderReference(this.state.id, recursionDetectingCallback, options)
    }


    /*shouldComponentUpdate(nextProps, nextState) {
        return !(
            [...(new Set([...Object.keys(this.props), ...Object.keys(nextProps)]))]
                .reduce((prev, key) => prev && this.props[key] === nextProps[key], true)
            &&
            [...(new Set([...Object.keys(this.state), ...Object.keys(nextState)]))]
                .reduce((prev, key) => prev && this.state[key] === nextState[key], true)
        )
    }*/

    componentDidMount() {
        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  componentDidMount`)

        if (!this.props.recursivelyDecorated) {
            this.renderReference()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  componentDidUpdate`)
        if (!this._recursivelyDecorated) {
            if (prevProps.block) {
                const propsOfInterest = new Set([...Object.keys(prevProps), ...Object.keys(this.props)])
                propsOfInterest.delete('layout')
                propsOfInterest.delete('children')
                for (let propName of propsOfInterest) {
                    if (prevProps[propName] !== this.props[propName]) {
                        prevProps.block.destroyReference(prevState.id)
                    }
                }
            }

            this.renderReference()
        }
    }

    componentWillUnmount() {
        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  componentWillUnmount`)

        if (this.props.block && !this._recursivelyDecorated) {
            console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  destroyReference`)
            this.props.block.destroyReference(this.state.id)
        }
    }
}

const ReferenceContainer = (props) => (
    <recursiveDecoratorContext.Consumer>
        {recursiveDecorators => (
            <parentBlockContext.Consumer>
                {parentBlocks => (
                    <Layout.Consumer>
                        {layout => (
                                <Reference 
                                    {...props} 
                                    block={layout.getBlock(props.name)} 
                                    parentBlocks={parentBlocks} 
                                    recursivelyDecorated={recursiveDecorators[props.name] && recursiveDecorators[props.name].includes(props.id)} />
                        )}
                    </Layout.Consumer>
                )}
            </parentBlockContext.Consumer>
        )}
    </recursiveDecoratorContext.Consumer>
)


export const Append = ({children, ...props}) => (
    <ReferenceContainer {...props}>
        {block => block.append(children)}
    </ReferenceContainer>
)

export const Prepend = ({children, ...props}) => (
    <ReferenceContainer {...props}>
        {block => block.prepend(children)}
    </ReferenceContainer>
)

export const Decorate = ({children, ...props}) => (
    <ReferenceContainer {...props}>
        {block => block.decorate(children)}
    </ReferenceContainer>
)


for (const name in module.exports) {
    ReferenceContainer[name] = module.exports[name]
}
export default ReferenceContainer