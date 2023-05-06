"use strict"

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} = require('../expressError');

const db = require('../db.js');
const User = require('./user.js');
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe('authenticate', function () {
    test('works', async() => {
        const user = await User.authenticate('test1', "password");
        expect(user).toEqual({
            username: "test1",
            firstName: "test",
            lastName: "test",
            phone: "0000000000",
            email: "test@gmail.com",
            isAdmin: false
        })
    });

    test('unauthenticate if no such user', async () => {
        try{
            await User.authenticate('test100', "password");
        }catch(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test('unauthenticate if incorrect password', async () => {
        try{
            await User.authenticate('test1', 'incorrectpass');
        }catch(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

/************************************** register */

describe('register', function () {
    const newUser = {
        username: "test_new",
        firstName: "test",
        lastName: "test",
        phone: "0000000000",
        email: "test@gmail.com",
        isAdmin: false
    };

    test('works', async() => {
        const user = await User.register({
            ...newUser,
            password: 'password'
        });
        expect(user).toEqual(newUser);
        const found = await db.query("SELECT * FROM users WHERE username = 'test_new'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(false);
        expect(found.rows[0].username).toEqual('test_new');
    });

    test('works when is_admin is true', async () => {
        const user = await User.register({
            ...newUser,
            password: "password",
            isAdmin: true
        });

        expect(user).toEqual({ ...newUser, isAdmin: true});
        const found = await db.query("SELECT * FROM users WHERE username = 'test_new'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(true);
        expect(found.rows[0].username).toEqual('test_new');
    })

    test('bad request with duplicate data', async() => {
        try{
            await User.register({
                ...newUser,
                password: "password"
            });
            await User.register({
                ...newUser,
                password: "password"
            });
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test('bad request with less digit in phone', async() => {
        try{
            await User.register({
                ...newUser,
                phone: "000000000"
            });
        } catch (err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe('findAll', function () {
    test('works', async () => {
        const users = await User.findAll();
        expect(users).toEqual([
            {
            username: "test1",
            firstName: "test",
            lastName: "test",
            phone: "0000000000",
            email: "test@gmail.com",
            isAdmin: false
            },
            {
            username: "test2",
            firstName: "test",
            lastName: "test",
            phone: "0000000000",
            email: "test@gmail.com",
            isAdmin: true
            }
        ]);
    });
});

/************************************** get */

describe('get', function () {
    test('works', async() => {
        const user = await User.get('test1');
        expect(user).toEqual({
            username: "test1",
            firstName: "test",
            lastName: "test",
            phone: "0000000000",
            email: "test@gmail.com",
            favorites: [],
            isAdmin: false
        });
    });

    test('not found if no such user', async () => {
        try{
            await User.get('no_user');
        }catch (err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})

/************************************** update */

describe('update', function() {
    const updateData = {
        firstName: "test_updated",
        lastName: "test",
        email: "test@gmail.com",
        isAdmin: true
    };

    test('works', async() => {
        const user = await User.update('test1', updateData);
        expect(user).toEqual({
            username: "test1",
            ...updateData,
            phone: "0000000000"
        });
    });

    test('works - set password', async () => {
        const user = await User.update('test1', {
            password: "updated"
        });

        expect(user).toEqual({
            username: "test1",
            firstName: "test",
            lastName: "test",
            email: "test@gmail.com",
            isAdmin: false,
            phone: "0000000000"
        });
        const found = await db.query(`SELECT * FROM users WHERE username = 'test1'`);
        expect(found.rows.length).toEqual(1);
        expect(user).toEqual({
            username: "test1",
            firstName: "test",
            lastName: "test",
            email: "test@gmail.com",
            isAdmin: false,
            phone: "0000000000"
        });
    });

    test('not found if no such user', async () => {
        try{
            await User.update('no', {
                firstName: "updated"
            });
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test('bad request error if no data', async () => {
        try{
            await User.update('test1', {});
        }catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
})

/************************************** remove */

describe('remove', function () {
    test('works', async () => {
        await User.remove('test1');
        const res = await db.query(
            `SELECT * FROM users WHERE username = 'test1'`);
        expect(res.rows.length).toEqual(0);
    });

    test('not found error if no such user', async () => {
        try{
            await User.remove('incorrect');
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})

/************************************** addToFavorite */

describe('addToFavorite', function() {
    test('works', async () => {
        await User.addToFavorite('test1', 'item1');
        const item1 = await db.query(`
            SELECT id
            FROM items
            WHERE item_name = 'item1'`)
        const item1Id = item1.rows[0].id;
        console.log('item1Id:', item1Id);
        const res = await db.query(`
            SELECT username, item_id AS itemId 
            FROM favorites 
            WHERE username = 'test1'`);
        expect(res.rows).toEqual([{
            username: 'test1',
            itemId: expect.any(Number)
        }]);
    });

    test('not found error if no such user', async () => {
        try{
            await User.addToFavorite('no', 'item1');
        }catch (err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test('not found error if no such itemName', async () => {
        try{
            await User.addToFavorite('test1', 'item');
        }catch (err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** removeFromFavorite */

describe('removeFromFavorite', function() {
    test('works', async () => {
        await User.addToFavorite('test1', 'item1');
        const res = await db.query(`
            SELECT * FROM favorites WHERE username = 'test1'`);
        expect(res.rows).toEqual([{
            username: 'test1',
            item_name: 'item1'
        }]);

        await User.removeFromFavorite('test1', 'item1');
        const remove = await db.query(`
            SELECT * FROM favorites WHERE username = 'test1'`);
        expect(remove.rows).toEqual([]);
    });

    test('not found error if no such user', async () => {
        try{
            await User.removeFromFavorite('no', 'item1');
        }catch (err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test('not found error if no such itemName', async () => {
        try{
            await User.addToFavorite('test1', 'item');
        }catch (err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})
