# Commenty

A microservice to create, update, and manage comments

## Description

A service similar to Disqus, a plug&play comments service, with rating,
replies, filters, and pagination.

The purpose of this project was to learn how things works without using libraries. Using pure experssjs with Postgres without using an ORM.

## Techstack

- ExpressJS

## Scripts

| Script   |          Description          |
| :------- | :---------------------------: |
| `create` | Running the Databse Migration |
| `dev`    |         Satrt Server          |

## Requirements

- The frontend repo which is a simple admin dashboard to moderate the comments - [web-commenty](https://github.com/Hashim-H/web-commenty)
- To run this project you need to have `node`, and `postgreSQL` installed.
- Refer to the `.env.*.example` in the server to see what env variables are
  needed to start the application correctly.

## Getting started

To get up and running follow these steps

- Install the dependencies by running `npm install --save` in the root of the project.
- Start the server with `npm run dev`

## Authors

- Hashim Haider - [Github](https://github.com/Hashim-H)
