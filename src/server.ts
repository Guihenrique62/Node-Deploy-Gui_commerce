import fastify from 'fastify'
import { createUser } from './routes/user/create-user';

import {serializerCompiler, validatorCompiler} from 'fastify-type-provider-zod'
import { getUsers } from './routes/user/get-users';
import { delUser } from './routes/user/delete-user';
import { updateUser } from './routes/user/update-user';
import { createProduct } from './routes/products/create-product';
import { getProducts } from './routes/products/get-product';
import { delProduct } from './routes/products/delete-product';
import { updateProduct } from './routes/products/update-product';
import { createRating } from './routes/products/create-rating';
import { updateRating } from './routes/products/update-rating';
import { loginRoute } from './routes/auth/login';
import { authenticate } from './routes/auth/authenticate';
import { buyProduct } from './routes/purchase/buy-product';
import { getUserPurchases } from './routes/purchase/get-userPurchases';
import { getPurchases } from './routes/purchase/get-purchases';
import { createCategory } from './routes/categories/create-category';
import { getProductsOfCategory } from './routes/categories/get-category';
import { getCategories } from './routes/categories/get-categories';

const app = fastify() 

// Routes User
app.register(createUser)
app.register(getUsers)
app.register(delUser)
app.register(updateUser)

// Routes Products
app.register(createProduct)
app.register(getProducts)
app.register(updateProduct)
app.register(delProduct)
app.register(createRating)
app.register(updateRating)

// Routes Purchase
app.register(buyProduct)
app.register(getUserPurchases)
app.register(getPurchases)

//Routes Categorys
app.register(createCategory)
app.register(getProductsOfCategory)
app.register(getCategories)


app.register(loginRoute)


app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

//Inicia o servidor
app.listen({ port: 3333, host: '0.0.0.0' }).then(()=>{
  console.log('HTTP server running')
})
