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

        before: PropTypes.string,
        after: PropTypes.string
    }

    static getDerivedStateFromProps(props) {
        return {
            callback: props.children instanceof Function ? props.children : block => block.append(props.children),
            id: props.id || uuidv4()
        }
    }

    render() {
        const {
            id,
            children,
            ...options
        } = this.props

        const {
            block
        } = this.state

        if (block && children) {
            block.renderReference(id, children, options)
        }

        return (
            <div className="layout-reference">
                <div>Reference: {this.props.name}</div>
            </div>
        )
    }

    componentWillUnmount() {
        this.props.block.destroyReference()
    }


    onlyChildrenUpdated() {

    }
    
    updateReference() {
        const {
            name,
            layout,
            children,
            ...options
        } = this.props

        if (this.reference) {
            this.reference.destroy()
        }
        this.reference = layout.createReference(name, children, options)
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


for (const name in module.exports) {
    ReferenceContainer[name] = module.exports[name]
}
export default ReferenceContainer