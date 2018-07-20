import React from 'react'
import {hot} from 'react-hot-loader'

import Layout from './Layout'
import Block from './Layout/Block'
import Reference from './Layout/Reference'

const Foo = ({children}) => {
    console.log("Rendering Foo")

    return children
}

const App = (props) => (
    <Layout>
        <Reference name="page.app">
            <Block name="foo.bar">
                <div>foo.bar</div>
            </Block>
        </Reference>
        <Reference name="foo.bar">
            Appended!
        </Reference>

        <Foo>
            <Block name="page.app" />
        </Foo>
    </Layout>
)


export default hot(module)(App)