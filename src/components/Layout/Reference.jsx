import PropTypes from 'prop-types'
import React from 'react'
import uuidv4 from 'uuid/v4'

import Layout from '../Layout'


class Reference extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        id: PropTypes.string,
        children: PropTypes.oneOfType([
            PropTypes.element,
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

    static getDerivedStateFromProps(props, state) {
        return {
            id: props.id || state.anonId,
            callback: props.children instanceof Function ? props.children : block => block.append(props.children)
        }
    }

    constructor() {
        super(...arguments)

        this.state = {
            callback: null,
            id: null,
            anonId: uuidv4()
        }
    }

    render() {
        return (
            <div className="layout-reference">
                <div>Reference '{this.state.id}' references '{this.props.name}'</div>
            </div>
        )
    }

    renderReference() {
        const {
            block,
            children,
            ...options
        } = this.props

        if (!block || !children) {
            return
        }


        block.renderReference(this.state.id, this.state.callback, options)
    }


    componentDidMount() {
        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  componentDidMount`)

        this.renderReference()
    }

    componentDidUpdate(prevProps, prevState) {
        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  componentDidUpdate`)

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

    componentWillUnmount() {
        console.info(`Reference[name="${this.props.name}", id="${this.state.id}"]:  componentWillUnmount`)

        if (this.props.block) {
            this.props.block.destroyReference(this.state.id)
        }
    }
}

const ReferenceContainer = (props) => (
    <Layout.Consumer>
        {layout => <Reference {...props} block={layout.getBlock(props.name)} />}
    </Layout.Consumer>
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