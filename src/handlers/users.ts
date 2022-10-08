import { User, UsersModel } from '../models/users'
import express, { Request, Response } from 'express'
import { body, param, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import { Sign, Verify } from '../helpers/jwt-helper'

dotenv.config()
const { SALT_ROUNDS, BCRYPT_PASSWORD } = process.env

const users = new UsersModel()

const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const {
      first_name,
      last_name,
      password,
    }: { first_name: string; last_name: string; password: string } = req.body

    // Hashing the password before adding it to DB
    const hash = bcrypt.hashSync(
      password + BCRYPT_PASSWORD,
      parseInt(SALT_ROUNDS as string)
    )
    const user: User = {
      first_name: first_name,
      last_name: last_name,
      password: hash,
    }
    const newUser = await users.create(user)
    const token = Sign(Number(newUser.id))
    res.status(201).json({ user: newUser, token: token })
  } catch (err) {
    res.status(500).json(err)
  }
}

const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const {
      first_name,
      last_name,
      password,
    }: { first_name: string; last_name: string; password: string } = req.body
    const existingUser = await users.getUserByFullName(first_name, last_name)
    if (!existingUser) {
      return res.status(403).json('wrong credentials')
    }
    if (
      !bcrypt.compareSync(password + BCRYPT_PASSWORD, existingUser.password)
    ) {
      return res.status(403).json('wrong credentials')
    }
    const token = Sign(Number(existingUser.id))
    res.json({ token })
  } catch (err) {
    res.status(500).json(err)
  }
}

const show = async (req: Request, res: Response) => {
  try {
    if (Verify(req)) {
      const id: number = parseInt(req.params.id)
      const user = await users.show(id)
      if (!user)
        return res.status(404).json("Couldn't find a user with the provided id")
      res.status(200).json({ user })
    } else {
      return res.status(403).json({ err: 'Token is invalid or expired' })
    }
  } catch (err) {
    res.status(500).json(err)
  }
}
const create = async (req: Request, res: Response) => {
  try {
    if (Verify(req)) {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const {
        first_name,
        last_name,
        password,
      }: { first_name: string; last_name: string; password: string } = req.body

      // Hashing the password before adding it to DB
      const hash = bcrypt.hashSync(
        password + BCRYPT_PASSWORD,
        parseInt(SALT_ROUNDS as string)
      )
      const user: User = {
        first_name: first_name,
        last_name: last_name,
        password: hash,
      }
      const newUser = await users.create(user)
      const token = Sign(Number(newUser.id))
      res.status(201).json({ user: newUser, token: token })
    } else {
      return res.status(403).json({ err: 'Token is invalid or expired' })
    }
  } catch (err) {
    res.status(500).json({ err })
  }
}
const index = async (req: Request, res: Response) => {
  try {
    if (Verify(req)) {
      const allUsers = await users.index()
      res.status(200).json({ users: allUsers })
    } else {
      return res.status(403).json({ err: 'Token is invalid or expired' })
    }
  } catch (err) {
    res.status(500).json({ err })
  }
}

//routes
const userRoutes = (app: express.Application) => {
  app.post(
    '/users/register',
    body('first_name').isString(),
    body('last_name').isString(),
    body('password').isStrongPassword(),
    register
  ),
    app.post(
      '/users/login',
      body('first_name').isString(),
      body('last_name').isString(),
      body('password').isString(),
      login
    ),
    app.post(
      '/users/',
      body('first_name').isString(),
      body('last_name').isString(),
      body('password').isStrongPassword(),
      create
    ),
    app.get('/users/:id', param('id').isNumeric(), show)
  app.get('/users/', index)
}

export default userRoutes
