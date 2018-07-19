import React from 'react'
import {hot} from 'react-hot-loader'

import Layout from './Layout'
import Block from './Layout/Block'
import Reference from './Layout/Reference'


const App = (props) => (
    <Layout>
        <Block name="app">
            <div>qwer</div>

            <Reference.Decorate name="app"  before="foo">
                {lastRender => <div style={{border: "1px solid black"}}><div>RECURSIVE</div><div style={{border: "1px solid black"}}>{lastRender}</div><div>DECORATOR</div></div>}
            </Reference.Decorate>
        </Block>
        
        <Reference.Prepend name="app">
            <div className="">Reference prepended successfully!  OwO</div>
        </Reference.Prepend>

        <Reference.Append name="app">
            <div className="">Reference appended successfully!  OwO</div>
        </Reference.Append>

        <Reference.Decorate name="app" id="foo">
            {prev => <div className="app-decorator"><div>Don't mind me.  Just decorating away.</div><div>{prev}</div><div>Still decorating.   Please ignore.</div></div>}
        </Reference.Decorate>

        {/*<div className="">
            <Block name="example.1"
        </div>*/}
    </Layout>
)


export default hot(module)(App)