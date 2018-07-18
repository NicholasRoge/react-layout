import React from 'react'
import {hot} from 'react-hot-loader'

import Layout from './Layout'
import Block from './Layout/Block'
import Reference from './Layout/Reference'


const App = (props) => (
    <Layout>
        <Block name="app">
            <div>qwer</div>
        </Block>
        
        <Reference.Append name="app">
            <div className="">Reference Appended Successfully</div>
        </Reference.Append>

        {/*<div className="">
            <Block name="example.1"
        </div>*/}
    </Layout>
)


export default hot(module)(App)