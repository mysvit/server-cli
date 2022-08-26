import { AuthModel, AuthType, DateDb, LoginModel, UserProfileModel, UserSignupModel, UserTbl, VerifyModel } from '@dto'
import { environment } from '@env'
import { ErrorApi500, ErrorsMsg, MathHelper, PasswordHash, ValueHelper } from '@shared'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { ParamValidation } from '../../validation'
import { Core } from '../core'

const {sign} = jwt

export class UserCore extends Core {

    /**
     * signup user
     * @param model
     */
    async signup(model: UserSignupModel): Promise<number> {
        model = new UserSignupModel(model)
        ParamValidation.allFieldRequired(model)
        await this.isEmailExist(model.email)
        const userTbl = this.createSignupModel(model)
        return this.userDb.insert(userTbl)
    }

    private isEmailExist = async (email: string): Promise<void> => {
        const result = await this.userDb.select(
            <UserTbl>{user_id: undefined},
            <UserTbl>{is_del: 0, email: email})
        if (!!result) {
            throw new ErrorApi500(ErrorsMsg.EmailRegistered)
        }
    }
    private createSignupModel = (model: UserSignupModel): UserTbl => {
        const saltedHash = PasswordHash.createSaltedHash(model.password)
        const verification_code = MathHelper.getRandomInt(10000, 99999)
        return <UserTbl>{
            user_id: randomUUID(),
            email: model.email,
            nickname: model.nickname,
            signup_date: new DateDb().value,
            password_hash: saltedHash.passwordHash,
            password_salt: saltedHash.passwordSalt,
            verification_code: verification_code
        }
    }

    /**
     * login user
     * @param model
     */
    async login(model: LoginModel): Promise<AuthModel> {
        model = new LoginModel(model)
        ParamValidation.allFieldRequired(model)
        const userTbl: UserTbl = await this.getUserIfExist(model)
        const needConfirm: AuthModel = await this.checkIfNeedConfirmation(model, userTbl)
        if (needConfirm) return needConfirm
        return this.getTokenIfPassOk(model, userTbl)
    }

    private getUserIfExist = async (model: LoginModel): Promise<UserTbl> => {
        const userTbl = await this.userDb.select(
            <UserTbl>{
                user_id: '',
                nickname: '',
                avatar_id: '',
                password_hash: '',
                password_salt: '',
                is_verified: 0
            },
            <UserTbl>{email: model.email, is_del: 0}
        )
        if (ValueHelper.isEmpty(userTbl)) {
            throw new ErrorApi500(ErrorsMsg.IncorrectEmailOrPassword)
        }
        return userTbl
    }
    private checkIfNeedConfirmation = async (model: LoginModel, userTbl: UserTbl): Promise<AuthModel> => {
        // if not confirmed & update pre_confirmed_hash and ask for confirmation
        const verifiedHash = PasswordHash.createSaltedHash(model.password, userTbl.password_salt)
        if (userTbl.is_verified == 0) {
            await this.userDb.update(
                <UserTbl>{pre_verified_hash: verifiedHash.passwordHash},
                <UserTbl>{user_id: userTbl.user_id, is_del: 0})
            return <AuthModel>{user_id: userTbl.user_id, authType: AuthType.NeedVerification}
        } else {
            return undefined
        }
    }
    private getTokenIfPassOk = (model: LoginModel, userTbl: UserTbl): AuthModel => {
        const verifiedHash = PasswordHash.createSaltedHash(model.password, userTbl.password_salt)
        // if confirmed check password
        if (verifiedHash.passwordHash !== userTbl.password_hash) {
            throw new ErrorApi500(ErrorsMsg.IncorrectEmailOrPassword)
        }
        // create token by sign
        const token = sign({user_id: userTbl.user_id}, environment.token_key, {expiresIn: '2h'})
        return <AuthModel>{
            user_id: userTbl.user_id,
            nickname: userTbl.nickname,
            avatar_id: userTbl.avatar_id,
            token: token,
            authType: AuthType.Authenticated
        }
    }


    /**
     * confirm code
     * @param user_id
     * @param verifyModel
     */
    async verify(user_id: string, verifyModel: VerifyModel): Promise<AuthModel> {
        ParamValidation.validateId(user_id)
        ParamValidation.validateVerificationCodeFormat(verifyModel.verification_code)
        await this.verifyCode(user_id, verifyModel.verification_code)
        await this.markUserVerified(user_id)
        return this.getTokenAfterVerification(user_id)
    }

    private verifyCode = async (user_id: string, verification_code: string): Promise<void> => {
        const result = await this.userDb.select(
            <UserTbl>{user_id: ''},
            <UserTbl>{is_del: 0, user_id: user_id, verification_code: verification_code})
        if (ValueHelper.isEmpty(result)) {
            throw new ErrorApi500(ErrorsMsg.VerificationCodeWrong)
        }
    }
    private markUserVerified = async (user_id: string) => {
        return this.userDb.update(
            <UserTbl>{is_verified: 1, verification_code: null},
            <UserTbl>{user_id: user_id, is_del: 0}
        )
    }
    private getTokenAfterVerification = async (user_id: string): Promise<AuthModel> => {
        // get previously login generated hash
        const userTbl = await this.userDb.select(
            <UserTbl>{nickname: '', avatar_id: '', pre_verified_hash: '', password_hash: ''},
            <UserTbl>{is_del: 0, user_id: user_id}
        )
        // create token by sign if password verified
        if (userTbl.pre_verified_hash === userTbl.password_hash) {
            const token = sign({user_id: user_id}, environment.token_key, {expiresIn: '2h'})
            return <AuthModel>{
                user_id: user_id,
                nickname: userTbl.nickname,
                avatar_id: userTbl.avatar_id,
                token: token,
                authType: AuthType.Authenticated
            }
        } else {
            return <AuthModel>{
                user_id: user_id,
                authType: AuthType.VerifiedButNotAuth
            }
        }
    }

    /**
     * get user profile
     * @param user_id
     */
    async getUserProfile(user_id: string): Promise<UserProfileModel> {
        ParamValidation.validateId(user_id)
        return this.userDb.select(
            <UserTbl>{user_id: '', nickname: '', email: '', avatar_id: ''},
            <UserTbl>{is_del: 0, user_id: user_id}
        )
    }

}
