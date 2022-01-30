import 'reflect-metadata'
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import resolvers from './resolvers'
import { TypegooseMiddleware } from './typegoose-middleware'
import { PostModel, CommentModel, UserModel } from './models'
const PORT = process.env.PORT || 8000
const main = async () => {
    const app = express()
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/sma')
    const db = mongoose.connection
    db.on('error', err => console.error(err))
    db.on('open', () => console.log('CONNECTED :D'))
    ;(global as any).PostModel = PostModel
    ;(global as any).CommentModel = CommentModel
    ;(global as any).UserModel = UserModel
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: Object.values(resolvers) as any,
            globalMiddlewares: [TypegooseMiddleware],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res })
    })
    await apollo.start()
    apollo.applyMiddleware({ app })
    app.listen(PORT, () =>
        console.log(`listening on port ${PORT} url: http://localhost:${PORT}`)
    )
}

main().catch(err => console.error(err))
