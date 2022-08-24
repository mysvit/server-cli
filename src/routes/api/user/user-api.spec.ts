import { environment } from '@env'
import { ApiPath } from '@shared'
import chai from 'chai'
import chaiHttp from 'chai-http'
import chaiSpies from 'chai-spies'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { afterEach } from 'mocha'
import { app } from '../../../server'
import { userCore } from '../../ref/core'

const {sign} = jwt
const expect = chai.expect
chai.use(chaiHttp)
chai.use(chaiSpies)

// test route path and called method
describe('UserApi', () => {

    const agent = chai.request.agent(app())

    afterEach(() => {
        chai.spy.restore(userCore)
    })

    it('POST ' + ApiPath.user_signup, async () => {
        const spy = chai.spy.on(userCore, 'signup', () => true)
        await agent
            .post(ApiPath.user_signup)
            .type('form')
            .send({})
        expect(spy).to.have.been.called()
    })

    // it('PUT ' + ApiPath.confirm_user, async () => {
    //     const spy = chai.spy.on(userCore, 'confirmEmail',
    //         (user_id, confirm_code) => user_id === 'uuid-uuid-uuid' && confirm_code === '12345')
    //     await agent
    //         .put(ApiPath.confirm_user.replace(':user_id', 'uuid-uuid-uuid').replace(':confirm_code', '12345'))
    //         .send({})
    //     expect(spy).to.eq(true)
    // })

    it('POST ' + ApiPath.user_login, async () => {
        const spy = chai.spy.on(userCore, 'login', () => true)
        await agent
            .post(ApiPath.user_login)
            .type('form')
            .send({})
        expect(spy).to.have.been.called()
    })

    it('GET ' + ApiPath.user_auth, async () => {
        const token = sign({user_id: 'user_test_uuid'}, environment.token_key, {expiresIn: '60s'})
        const auth = await agent
            .get(ApiPath.user_auth)
            .query({user_id: 'uuid'})
            .set({'user_id': 'user_test_uuid', 'authorization': 'Bearer ' + token})
        expect(auth).to.have.status(StatusCodes.OK)
    })

    it('GET ' + ApiPath.user_auth + ' BAD TOKEN', async () => {
        const token = sign({user_id: 'bad id bad token'}, environment.token_key, {expiresIn: '60s'})
        const auth = await agent
            .get(ApiPath.user_auth)
            .query({user_id: 'uuid'})
            .set({'user_id': 'user_test_uuid', 'authorization': 'Bearer ' + token})
        expect(auth).to.have.status(StatusCodes.UNAUTHORIZED)
    })

    it('GET ' + ApiPath.user_auth + ' NOT USER OR TOKEN', async () => {
        let auth = await agent
            .get(ApiPath.user_auth)
            .query({user_id: 'uuid'})
            .set({'user_id': 'user_test_uuid'})
        expect(auth).to.have.status(StatusCodes.FORBIDDEN)
        auth = await agent
            .get(ApiPath.user_auth)
            .query({user_id: 'uuid'})
            .set({'authorization': 'Bearer ..token..'})
        expect(auth).to.have.status(StatusCodes.FORBIDDEN)
    })

    // it('GET ' + ApiPath.user_get_profile_short, async () => {
    //     const spy = chai.spy.on(userCore, 'getProfileShort', () => true)
    //     const token = sign({user_id: 'user_test_uuid'}, environment.token_key, {expiresIn: '60s'})
    //     await agent
    //         .get(ApiPath.user_get_profile_short)
    //         .query({user_id: 'uuid'})
    //         .set({'user_id': 'user_test_uuid', 'authorization': 'Bearer ' + token})
    //     expect(spy).to.have.been.called()
    // })

})
