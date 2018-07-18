import React from 'react'

const context = React.createContext()


const apiMethod = (target, name, descriptor) => {
    if (typeof descriptor.value === 'function') {
        const apiMethodNames = target.apiMethodNames || []
        apiMethodNames.push(name)
        target.apiMethodNames = apiMethodNames
    }

    return descriptor
}

class Layout extends React.Component {
    static Consumer = context.Consumer
    static Provider = context.Provider

    constructor() {
        super(...arguments)

        this.apiMethods = {}
        for (const name of this.apiMethodNames) {
            this.apiMethods[name] = this[name].bind(this)
        }

        this.state = {
            data: {
                blocks: {}
            },

            ...this.apiMethods
        }
    }

    render() {
        return (
            <Layout.Provider value={this.state}>
                {this.props.children}
            </Layout.Provider>
        )
    }

    @apiMethod
    createBlock(name, referenceCreator) {
        const self = this

        

        if (this.getBlock(name)) {
            throw new Error(`A block with name '${name}' already exists.`)
        }

        const block = {
            name,
            createReference: referenceCreator,
            destroy: () => {
                this.setState((prevState) => {
                    if (prevState.data.blocks[name] !== block) {
                        return  // Prevent multiple calls to destroy
                    }

                    const blocks = prevState.data.blocks
                    delete blocks[name]
                    return {
                        data: {
                            ...prevState.data,
                            blocks
                        }
                    }
                })
            }
        }
        this.setState((prevState) => ({
            data: {
                blocks: {
                    ...prevState.blocks,
                    [name]: block
                }
            }
        }))

        return block
    }

    @apiMethod
    getBlock(name) {
        return this.state.data.blocks[name] || null
    }

    @apiMethod
    createReference(name, id, callback, options = {}) {
        const block = this.getBlock()
        if (!block) {
            return null
        }

        return block.createReference(id, callback, options)
    }
}

export default Layout