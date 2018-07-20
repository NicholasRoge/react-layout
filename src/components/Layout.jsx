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
    createBlock(name, api) {
        const self = this

        

        if (this.getBlock(name)) {
            throw new Error(`A block with name '${name}' already exists.`)
        }

        const block = {
            name,
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
            },

            ...api
        }

        this.setState((prevState) => {
            const nextState = {
                data: {
                    ...prevState.data,
                    blocks: {
                        ...prevState.data.blocks,
                        [name]: block
                    }
                }
            }
            
            return nextState
        })

        return block
    }

    @apiMethod
    getBlock(name) {
        return this.state.data.blocks[name] || null
    }
}

export default Layout