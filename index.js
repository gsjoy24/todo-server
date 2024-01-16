const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

app.listen(port, () => {
	console.log(`server is running on ${port} for Todo`);
});

app.get('/', (req, res) => {
	res.send(`server is running for Todo`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.nbdk5o7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	}
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		client.connect();

		// * collections
		const todoCollection = client.db('Todo').collection('todos');

		// add todos
		app.post('/todos', async (req, res) => {
			const newTodo = req.body;
			const result = await todoCollection.insertOne(newTodo);
			res.send(result);
		});

		// get todos
		app.get('/todos', async (req, res) => {
			const todos = await todoCollection.find().toArray();
			res.send(todos);
		});

		// get single todo
		app.get('/todos/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await todoCollection.findOne(query);
			res.send(result);
		});

		// update todo
		app.put('/todos/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const update = { $set: req.body };
			const options = { returnOriginal: false };
			const result = await todoCollection.findOneAndUpdate(query, update, options);
			res.send(result.value);
		});

		// delete todo
		app.delete('/todos/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await todoCollection.deleteOne(query);
			res.send(result);
		});

		// toggle completed
		app.patch('/todos/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const update = { $set: { completed: true } };

			const currentTodo = await todoCollection.findOne(query);

			// Toggle the value of the completed field directly in the $set object
			update.$set.completed = currentTodo.completed ? !currentTodo.completed : true;

			const result = await todoCollection.findOneAndUpdate(query, update);

			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log('Pinged your deployment. You successfully connected to MongoDB!');
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);
