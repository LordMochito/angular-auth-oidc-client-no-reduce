/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { hextob64u, KEYUTIL, KJUR } from 'jsrsasign';
import { EqualityHelperService } from './oidc-equality-helper.service';
import { TokenHelperService } from './oidc-token-helper.service';
import { LoggerService } from './oidc.logger.service';
// http://openid.net/specs/openid-connect-implicit-1_0.html
// id_token
// id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
// MUST exactly match the value of the iss (issuer) Claim.
//
// id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
// by the iss (issuer) Claim as an audience.The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
// or if it contains additional audiences not trusted by the Client.
//
// id_token C3: If the ID Token contains multiple audiences, the Client SHOULD verify that an azp Claim is present.
//
// id_token C4: If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
//
// id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the
// alg Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
//
// id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the OpenID Connect Core 1.0
// [OpenID.Core] specification.
//
// id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account
// for clock skew).
//
// id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
// limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
//
// id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one that was sent
// in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.The precise method for detecting replay attacks
// is Client specific.
//
// id_token C10: If the acr Claim was requested, the Client SHOULD check that the asserted Claim Value is appropriate.
// The meaning and processing of acr Claim Values is out of scope for this document.
//
// id_token C11: When a max_age request is made, the Client SHOULD check the auth_time Claim value and request re- authentication
// if it determines too much time has elapsed since the last End- User authentication.
// Access Token Validation
// access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
// for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
// access_token C2: Take the left- most half of the hash and base64url- encode it.
// access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash is present in the ID Token.
var OidcSecurityValidation = /** @class */ (function () {
    function OidcSecurityValidation(arrayHelperService, tokenHelperService, loggerService) {
        this.arrayHelperService = arrayHelperService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
    // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
    /**
     * @param {?} token
     * @param {?=} offsetSeconds
     * @return {?}
     */
    OidcSecurityValidation.prototype.isTokenExpired = 
    // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
    /**
     * @param {?} token
     * @param {?=} offsetSeconds
     * @return {?}
     */
    function (token, offsetSeconds) {
        /** @type {?} */
        var decoded;
        decoded = this.tokenHelperService.getPayloadFromToken(token, false);
        return !this.validate_id_token_exp_not_expired(decoded, offsetSeconds);
    };
    // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
    // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
    /**
     * @param {?} decoded_id_token
     * @param {?=} offsetSeconds
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_id_token_exp_not_expired = 
    // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
    /**
     * @param {?} decoded_id_token
     * @param {?=} offsetSeconds
     * @return {?}
     */
    function (decoded_id_token, offsetSeconds) {
        /** @type {?} */
        var tokenExpirationDate = this.tokenHelperService.getTokenExpirationDate(decoded_id_token);
        offsetSeconds = offsetSeconds || 0;
        if (!tokenExpirationDate) {
            return false;
        }
        /** @type {?} */
        var tokenExpirationValue = tokenExpirationDate.valueOf();
        /** @type {?} */
        var nowWithOffset = new Date().valueOf() + offsetSeconds * 1000;
        /** @type {?} */
        var tokenNotExpired = tokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug("Token not expired?: " + tokenExpirationValue + " > " + nowWithOffset + "  (" + tokenNotExpired + ")");
        // Token not expired?
        return tokenNotExpired;
    };
    // iss
    // REQUIRED. Issuer Identifier for the Issuer of the response.The iss value is a case-sensitive URL using the https scheme that contains scheme, host,
    // and optionally, port number and path components and no query or fragment components.
    //
    // sub
    // REQUIRED. Subject Identifier.Locally unique and never reassigned identifier within the Issuer for the End- User,
    // which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
    // It MUST NOT exceed 255 ASCII characters in length.The sub value is a case-sensitive string.
    //
    // aud
    // REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the Relying Party as an audience value.
    // It MAY also contain identifiers for other audiences.In the general case, the aud value is an array of case-sensitive strings.
    // In the common special case when there is one audience, the aud value MAY be a single case-sensitive string.
    //
    // exp
    // REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing.
    // The processing of this parameter requires that the current date/ time MUST be before the expiration date/ time listed in the value.
    // Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
    // Its value is a JSON [RFC7159] number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured in UTC until the date/ time.
    // See RFC 3339 [RFC3339] for details regarding date/ times in general and UTC in particular.
    //
    // iat
    // REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured
    // in UTC until the date/ time.
    // iss
    // REQUIRED. Issuer Identifier for the Issuer of the response.The iss value is a case-sensitive URL using the https scheme that contains scheme, host,
    // and optionally, port number and path components and no query or fragment components.
    //
    // sub
    // REQUIRED. Subject Identifier.Locally unique and never reassigned identifier within the Issuer for the End- User,
    // which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
    // It MUST NOT exceed 255 ASCII characters in length.The sub value is a case-sensitive string.
    //
    // aud
    // REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the Relying Party as an audience value.
    // It MAY also contain identifiers for other audiences.In the general case, the aud value is an array of case-sensitive strings.
    // In the common special case when there is one audience, the aud value MAY be a single case-sensitive string.
    //
    // exp
    // REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing.
    // The processing of this parameter requires that the current date/ time MUST be before the expiration date/ time listed in the value.
    // Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
    // Its value is a JSON [RFC7159] number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured in UTC until the date/ time.
    // See RFC 3339 [RFC3339] for details regarding date/ times in general and UTC in particular.
    //
    // iat
    // REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured
    // in UTC until the date/ time.
    /**
     * @param {?} dataIdToken
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_required_id_token = 
    // iss
    // REQUIRED. Issuer Identifier for the Issuer of the response.The iss value is a case-sensitive URL using the https scheme that contains scheme, host,
    // and optionally, port number and path components and no query or fragment components.
    //
    // sub
    // REQUIRED. Subject Identifier.Locally unique and never reassigned identifier within the Issuer for the End- User,
    // which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
    // It MUST NOT exceed 255 ASCII characters in length.The sub value is a case-sensitive string.
    //
    // aud
    // REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the Relying Party as an audience value.
    // It MAY also contain identifiers for other audiences.In the general case, the aud value is an array of case-sensitive strings.
    // In the common special case when there is one audience, the aud value MAY be a single case-sensitive string.
    //
    // exp
    // REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing.
    // The processing of this parameter requires that the current date/ time MUST be before the expiration date/ time listed in the value.
    // Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
    // Its value is a JSON [RFC7159] number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured in UTC until the date/ time.
    // See RFC 3339 [RFC3339] for details regarding date/ times in general and UTC in particular.
    //
    // iat
    // REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured
    // in UTC until the date/ time.
    /**
     * @param {?} dataIdToken
     * @return {?}
     */
    function (dataIdToken) {
        /** @type {?} */
        var validated = true;
        if (!dataIdToken.hasOwnProperty('iss')) {
            validated = false;
            this.loggerService.logWarning('iss is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('sub')) {
            validated = false;
            this.loggerService.logWarning('sub is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('aud')) {
            validated = false;
            this.loggerService.logWarning('aud is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('exp')) {
            validated = false;
            this.loggerService.logWarning('exp is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            validated = false;
            this.loggerService.logWarning('iat is missing, this is required in the id_token');
        }
        return validated;
    };
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    /**
     * @param {?} dataIdToken
     * @param {?} max_offset_allowed_in_seconds
     * @param {?} disable_iat_offset_validation
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_id_token_iat_max_offset = 
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    /**
     * @param {?} dataIdToken
     * @param {?} max_offset_allowed_in_seconds
     * @param {?} disable_iat_offset_validation
     * @return {?}
     */
    function (dataIdToken, max_offset_allowed_in_seconds, disable_iat_offset_validation) {
        if (disable_iat_offset_validation) {
            return true;
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            return false;
        }
        /** @type {?} */
        var dateTime_iat_id_token = new Date(0);
        dateTime_iat_id_token.setUTCSeconds(dataIdToken.iat);
        max_offset_allowed_in_seconds = max_offset_allowed_in_seconds || 0;
        if (dateTime_iat_id_token == null) {
            return false;
        }
        this.loggerService.logDebug('validate_id_token_iat_max_offset: ' +
            (new Date().valueOf() - dateTime_iat_id_token.valueOf()) +
            ' < ' +
            max_offset_allowed_in_seconds * 1000);
        return new Date().valueOf() - dateTime_iat_id_token.valueOf() < max_offset_allowed_in_seconds * 1000;
    };
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    /**
     * @param {?} dataIdToken
     * @param {?} local_nonce
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_id_token_nonce = 
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    /**
     * @param {?} dataIdToken
     * @param {?} local_nonce
     * @return {?}
     */
    function (dataIdToken, local_nonce) {
        /** @type {?} */
        var isFromRefreshToken = dataIdToken.nonce === undefined && local_nonce === OidcSecurityValidation.RefreshTokenNoncePlaceholder;
        if (!isFromRefreshToken && dataIdToken.nonce !== local_nonce) {
            this.loggerService.logDebug('Validate_id_token_nonce failed, dataIdToken.nonce: ' + dataIdToken.nonce + ' local_nonce:' + local_nonce);
            return false;
        }
        return true;
    };
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    /**
     * @param {?} dataIdToken
     * @param {?} authWellKnownEndpoints_issuer
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_id_token_iss = 
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    /**
     * @param {?} dataIdToken
     * @param {?} authWellKnownEndpoints_issuer
     * @return {?}
     */
    function (dataIdToken, authWellKnownEndpoints_issuer) {
        if (((/** @type {?} */ (dataIdToken.iss))) !== ((/** @type {?} */ (authWellKnownEndpoints_issuer)))) {
            this.loggerService.logDebug('Validate_id_token_iss failed, dataIdToken.iss: ' +
                dataIdToken.iss +
                ' authWellKnownEndpoints issuer:' +
                authWellKnownEndpoints_issuer);
            return false;
        }
        return true;
    };
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    /**
     * @param {?} dataIdToken
     * @param {?} aud
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_id_token_aud = 
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    /**
     * @param {?} dataIdToken
     * @param {?} aud
     * @return {?}
     */
    function (dataIdToken, aud) {
        if (dataIdToken.aud instanceof Array) {
            /** @type {?} */
            var result = this.arrayHelperService.areEqual(dataIdToken.aud, aud);
            if (!result) {
                this.loggerService.logDebug('Validate_id_token_aud  array failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
                return false;
            }
            return true;
        }
        else if (dataIdToken.aud !== aud) {
            this.loggerService.logDebug('Validate_id_token_aud failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
            return false;
        }
        return true;
    };
    /**
     * @param {?} state
     * @param {?} local_state
     * @return {?}
     */
    OidcSecurityValidation.prototype.validateStateFromHashCallback = /**
     * @param {?} state
     * @param {?} local_state
     * @return {?}
     */
    function (state, local_state) {
        if (((/** @type {?} */ (state))) !== ((/** @type {?} */ (local_state)))) {
            this.loggerService.logDebug('ValidateStateFromHashCallback failed, state: ' + state + ' local_state:' + local_state);
            return false;
        }
        return true;
    };
    /**
     * @param {?} id_token_sub
     * @param {?} userdata_sub
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_userdata_sub_id_token = /**
     * @param {?} id_token_sub
     * @param {?} userdata_sub
     * @return {?}
     */
    function (id_token_sub, userdata_sub) {
        if (((/** @type {?} */ (id_token_sub))) !== ((/** @type {?} */ (userdata_sub)))) {
            this.loggerService.logDebug('validate_userdata_sub_id_token failed, id_token_sub: ' + id_token_sub + ' userdata_sub:' + userdata_sub);
            return false;
        }
        return true;
    };
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    /**
     * @param {?} id_token
     * @param {?} jwtkeys
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_signature_id_token = 
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    /**
     * @param {?} id_token
     * @param {?} jwtkeys
     * @return {?}
     */
    function (id_token, jwtkeys) {
        var e_1, _a, e_2, _b, e_3, _c;
        if (!jwtkeys || !jwtkeys.keys) {
            return false;
        }
        /** @type {?} */
        var header_data = this.tokenHelperService.getHeaderFromToken(id_token, false);
        if (Object.keys(header_data).length === 0 && header_data.constructor === Object) {
            this.loggerService.logWarning('id token has no header data');
            return false;
        }
        /** @type {?} */
        var kid = header_data.kid;
        /** @type {?} */
        var alg = header_data.alg;
        if ('RS256' !== ((/** @type {?} */ (alg)))) {
            this.loggerService.logWarning('Only RS256 supported');
            return false;
        }
        /** @type {?} */
        var isValid = false;
        if (!header_data.hasOwnProperty('kid')) {
            // exactly 1 key in the jwtkeys and no kid in the Jose header
            // kty	"RSA" use "sig"
            /** @type {?} */
            var amountOfMatchingKeys = 0;
            try {
                for (var _d = tslib_1.__values(jwtkeys.keys), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var key = _e.value;
                    if (((/** @type {?} */ (key.kty))) === 'RSA' && ((/** @type {?} */ (key.use))) === 'sig') {
                        amountOfMatchingKeys = amountOfMatchingKeys + 1;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (amountOfMatchingKeys === 0) {
                this.loggerService.logWarning('no keys found, incorrect Signature, validation failed for id_token');
                return false;
            }
            else if (amountOfMatchingKeys > 1) {
                this.loggerService.logWarning('no ID Token kid claim in JOSE header and multiple supplied in jwks_uri');
                return false;
            }
            else {
                try {
                    for (var _f = tslib_1.__values(jwtkeys.keys), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var key = _g.value;
                        if (((/** @type {?} */ (key.kty))) === 'RSA' && ((/** @type {?} */ (key.use))) === 'sig') {
                            /** @type {?} */
                            var publickey = KEYUTIL.getKey(key);
                            isValid = KJUR.jws.JWS.verify(id_token, publickey, ['RS256']);
                            if (!isValid) {
                                this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                            }
                            return isValid;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        else {
            try {
                // kid in the Jose header of id_token
                for (var _h = tslib_1.__values(jwtkeys.keys), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var key = _j.value;
                    if (((/** @type {?} */ (key.kid))) === ((/** @type {?} */ (kid)))) {
                        /** @type {?} */
                        var publickey = KEYUTIL.getKey(key);
                        isValid = KJUR.jws.JWS.verify(id_token, publickey, ['RS256']);
                        if (!isValid) {
                            this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                        }
                        return isValid;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        return isValid;
    };
    /**
     * @param {?} response_type
     * @return {?}
     */
    OidcSecurityValidation.prototype.config_validate_response_type = /**
     * @param {?} response_type
     * @return {?}
     */
    function (response_type) {
        if (response_type === 'id_token token' || response_type === 'id_token') {
            return true;
        }
        if (response_type === 'code') {
            return true;
        }
        this.loggerService.logWarning('module configure incorrect, invalid response_type:' + response_type);
        return false;
    };
    // Accepts ID Token without 'kid' claim in JOSE header if only one JWK supplied in 'jwks_url'
    //// private validate_no_kid_in_header_only_one_allowed_in_jwtkeys(header_data: any, jwtkeys: any): boolean {
    ////    this.oidcSecurityCommon.logDebug('amount of jwtkeys.keys: ' + jwtkeys.keys.length);
    ////    if (!header_data.hasOwnProperty('kid')) {
    ////        // no kid defined in Jose header
    ////        if (jwtkeys.keys.length != 1) {
    ////            this.oidcSecurityCommon.logDebug('jwtkeys.keys.length != 1 and no kid in header');
    ////            return false;
    ////        }
    ////    }
    ////    return true;
    //// }
    // Access Token Validation
    // access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
    // for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
    // access_token C2: Take the left- most half of the hash and base64url- encode it.
    // access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash
    // is present in the ID Token.
    // Accepts ID Token without 'kid' claim in JOSE header if only one JWK supplied in 'jwks_url'
    //// private validate_no_kid_in_header_only_one_allowed_in_jwtkeys(header_data: any, jwtkeys: any): boolean {
    ////    this.oidcSecurityCommon.logDebug('amount of jwtkeys.keys: ' + jwtkeys.keys.length);
    ////    if (!header_data.hasOwnProperty('kid')) {
    ////        // no kid defined in Jose header
    ////        if (jwtkeys.keys.length != 1) {
    ////            this.oidcSecurityCommon.logDebug('jwtkeys.keys.length != 1 and no kid in header');
    ////            return false;
    ////        }
    ////    }
    ////    return true;
    //// }
    // Access Token Validation
    // access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
    // for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
    // access_token C2: Take the left- most half of the hash and base64url- encode it.
    // access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash
    // is present in the ID Token.
    /**
     * @param {?} access_token
     * @param {?} at_hash
     * @param {?} isCodeFlow
     * @return {?}
     */
    OidcSecurityValidation.prototype.validate_id_token_at_hash = 
    // Accepts ID Token without 'kid' claim in JOSE header if only one JWK supplied in 'jwks_url'
    //// private validate_no_kid_in_header_only_one_allowed_in_jwtkeys(header_data: any, jwtkeys: any): boolean {
    ////    this.oidcSecurityCommon.logDebug('amount of jwtkeys.keys: ' + jwtkeys.keys.length);
    ////    if (!header_data.hasOwnProperty('kid')) {
    ////        // no kid defined in Jose header
    ////        if (jwtkeys.keys.length != 1) {
    ////            this.oidcSecurityCommon.logDebug('jwtkeys.keys.length != 1 and no kid in header');
    ////            return false;
    ////        }
    ////    }
    ////    return true;
    //// }
    // Access Token Validation
    // access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
    // for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
    // access_token C2: Take the left- most half of the hash and base64url- encode it.
    // access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash
    // is present in the ID Token.
    /**
     * @param {?} access_token
     * @param {?} at_hash
     * @param {?} isCodeFlow
     * @return {?}
     */
    function (access_token, at_hash, isCodeFlow) {
        this.loggerService.logDebug('at_hash from the server:' + at_hash);
        // The at_hash is optional for the code flow
        if (isCodeFlow) {
            if (!((/** @type {?} */ (at_hash)))) {
                this.loggerService.logDebug('Code Flow active, and no at_hash in the id_token, skipping check!');
                return true;
            }
        }
        /** @type {?} */
        var testdata = this.generate_at_hash('' + access_token);
        this.loggerService.logDebug('at_hash client validation not decoded:' + testdata);
        if (testdata === ((/** @type {?} */ (at_hash)))) {
            return true; // isValid;
        }
        else {
            /** @type {?} */
            var testValue = this.generate_at_hash('' + decodeURIComponent(access_token));
            this.loggerService.logDebug('-gen access--' + testValue);
            if (testValue === ((/** @type {?} */ (at_hash)))) {
                return true; // isValid
            }
        }
        return false;
    };
    /**
     * @private
     * @param {?} access_token
     * @return {?}
     */
    OidcSecurityValidation.prototype.generate_at_hash = /**
     * @private
     * @param {?} access_token
     * @return {?}
     */
    function (access_token) {
        /** @type {?} */
        var hash = KJUR.crypto.Util.hashString(access_token, 'sha256');
        /** @type {?} */
        var first128bits = hash.substr(0, hash.length / 2);
        /** @type {?} */
        var testdata = hextob64u(first128bits);
        return testdata;
    };
    /**
     * @param {?} code_challenge
     * @return {?}
     */
    OidcSecurityValidation.prototype.generate_code_verifier = /**
     * @param {?} code_challenge
     * @return {?}
     */
    function (code_challenge) {
        /** @type {?} */
        var hash = KJUR.crypto.Util.hashString(code_challenge, 'sha256');
        /** @type {?} */
        var testdata = hextob64u(hash);
        return testdata;
    };
    OidcSecurityValidation.RefreshTokenNoncePlaceholder = '--RefreshToken--';
    OidcSecurityValidation.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    OidcSecurityValidation.ctorParameters = function () { return [
        { type: EqualityHelperService },
        { type: TokenHelperService },
        { type: LoggerService }
    ]; };
    return OidcSecurityValidation;
}());
export { OidcSecurityValidation };
if (false) {
    /** @type {?} */
    OidcSecurityValidation.RefreshTokenNoncePlaceholder;
    /**
     * @type {?}
     * @private
     */
    OidcSecurityValidation.prototype.arrayHelperService;
    /**
     * @type {?}
     * @private
     */
    OidcSecurityValidation.prototype.tokenHelperService;
    /**
     * @type {?}
     * @private
     */
    OidcSecurityValidation.prototype.loggerService;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy5zZWN1cml0eS52YWxpZGF0aW9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3NlcnZpY2VzL29pZGMuc2VjdXJpdHkudmFsaWRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDdEQ7SUFLSSxnQ0FDWSxrQkFBeUMsRUFDekMsa0JBQXNDLEVBQ3RDLGFBQTRCO1FBRjVCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBdUI7UUFDekMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUNyQyxDQUFDO0lBRUosMEpBQTBKOzs7Ozs7O0lBQzFKLCtDQUFjOzs7Ozs7O0lBQWQsVUFBZSxLQUFhLEVBQUUsYUFBc0I7O1lBQzVDLE9BQVk7UUFDaEIsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFcEUsT0FBTyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELDBKQUEwSjs7Ozs7OztJQUMxSixrRUFBaUM7Ozs7Ozs7SUFBakMsVUFBa0MsZ0JBQXdCLEVBQUUsYUFBc0I7O1lBQ3hF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SUFrVkM7U0FqVlksc0JBQXNCOzs7SUFFL0Isb0RBQXlEOzs7OztJQUdyRCxvREFBaUQ7Ozs7O0lBQ2pELG9EQUE4Qzs7Ozs7SUFDOUMsK0NBQW9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBoZXh0b2I2NHUsIEtFWVVUSUwsIEtKVVIgfSBmcm9tICdqc3JzYXNpZ24nO1xyXG5pbXBvcnQgeyBFcXVhbGl0eUhlbHBlclNlcnZpY2UgfSBmcm9tICcuL29pZGMtZXF1YWxpdHktaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL29pZGMtdG9rZW4taGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9vaWRjLmxvZ2dlci5zZXJ2aWNlJztcclxuXHJcbi8vIGh0dHA6Ly9vcGVuaWQubmV0L3NwZWNzL29wZW5pZC1jb25uZWN0LWltcGxpY2l0LTFfMC5odG1sXHJcblxyXG4vLyBpZF90b2tlblxyXG4vLyBpZF90b2tlbiBDMTogVGhlIElzc3VlciBJZGVudGlmaWVyIGZvciB0aGUgT3BlbklEIFByb3ZpZGVyICh3aGljaCBpcyB0eXBpY2FsbHkgb2J0YWluZWQgZHVyaW5nIERpc2NvdmVyeSlcclxuLy8gTVVTVCBleGFjdGx5IG1hdGNoIHRoZSB2YWx1ZSBvZiB0aGUgaXNzIChpc3N1ZXIpIENsYWltLlxyXG4vL1xyXG4vLyBpZF90b2tlbiBDMjogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoYXQgdGhlIGF1ZCAoYXVkaWVuY2UpIENsYWltIGNvbnRhaW5zIGl0cyBjbGllbnRfaWQgdmFsdWUgcmVnaXN0ZXJlZCBhdCB0aGUgSXNzdWVyIGlkZW50aWZpZWRcclxuLy8gYnkgdGhlIGlzcyAoaXNzdWVyKSBDbGFpbSBhcyBhbiBhdWRpZW5jZS5UaGUgSUQgVG9rZW4gTVVTVCBiZSByZWplY3RlZCBpZiB0aGUgSUQgVG9rZW4gZG9lcyBub3QgbGlzdCB0aGUgQ2xpZW50IGFzIGEgdmFsaWQgYXVkaWVuY2UsXHJcbi8vIG9yIGlmIGl0IGNvbnRhaW5zIGFkZGl0aW9uYWwgYXVkaWVuY2VzIG5vdCB0cnVzdGVkIGJ5IHRoZSBDbGllbnQuXHJcbi8vXHJcbi8vIGlkX3Rva2VuIEMzOiBJZiB0aGUgSUQgVG9rZW4gY29udGFpbnMgbXVsdGlwbGUgYXVkaWVuY2VzLCB0aGUgQ2xpZW50IFNIT1VMRCB2ZXJpZnkgdGhhdCBhbiBhenAgQ2xhaW0gaXMgcHJlc2VudC5cclxuLy9cclxuLy8gaWRfdG9rZW4gQzQ6IElmIGFuIGF6cCAoYXV0aG9yaXplZCBwYXJ0eSkgQ2xhaW0gaXMgcHJlc2VudCwgdGhlIENsaWVudCBTSE9VTEQgdmVyaWZ5IHRoYXQgaXRzIGNsaWVudF9pZCBpcyB0aGUgQ2xhaW0gVmFsdWUuXHJcbi8vXHJcbi8vIGlkX3Rva2VuIEM1OiBUaGUgQ2xpZW50IE1VU1QgdmFsaWRhdGUgdGhlIHNpZ25hdHVyZSBvZiB0aGUgSUQgVG9rZW4gYWNjb3JkaW5nIHRvIEpXUyBbSldTXSB1c2luZyB0aGUgYWxnb3JpdGhtIHNwZWNpZmllZCBpbiB0aGVcclxuLy8gYWxnIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIEpPU0UgSGVhZGVyLlRoZSBDbGllbnQgTVVTVCB1c2UgdGhlIGtleXMgcHJvdmlkZWQgYnkgdGhlIElzc3Vlci5cclxuLy9cclxuLy8gaWRfdG9rZW4gQzY6IFRoZSBhbGcgdmFsdWUgU0hPVUxEIGJlIFJTMjU2LiBWYWxpZGF0aW9uIG9mIHRva2VucyB1c2luZyBvdGhlciBzaWduaW5nIGFsZ29yaXRobXMgaXMgZGVzY3JpYmVkIGluIHRoZSBPcGVuSUQgQ29ubmVjdCBDb3JlIDEuMFxyXG4vLyBbT3BlbklELkNvcmVdIHNwZWNpZmljYXRpb24uXHJcbi8vXHJcbi8vIGlkX3Rva2VuIEM3OiBUaGUgY3VycmVudCB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSB0aW1lIHJlcHJlc2VudGVkIGJ5IHRoZSBleHAgQ2xhaW0gKHBvc3NpYmx5IGFsbG93aW5nIGZvciBzb21lIHNtYWxsIGxlZXdheSB0byBhY2NvdW50XHJcbi8vIGZvciBjbG9jayBza2V3KS5cclxuLy9cclxuLy8gaWRfdG9rZW4gQzg6IFRoZSBpYXQgQ2xhaW0gY2FuIGJlIHVzZWQgdG8gcmVqZWN0IHRva2VucyB0aGF0IHdlcmUgaXNzdWVkIHRvbyBmYXIgYXdheSBmcm9tIHRoZSBjdXJyZW50IHRpbWUsXHJcbi8vIGxpbWl0aW5nIHRoZSBhbW91bnQgb2YgdGltZSB0aGF0IG5vbmNlcyBuZWVkIHRvIGJlIHN0b3JlZCB0byBwcmV2ZW50IGF0dGFja3MuVGhlIGFjY2VwdGFibGUgcmFuZ2UgaXMgQ2xpZW50IHNwZWNpZmljLlxyXG4vL1xyXG4vLyBpZF90b2tlbiBDOTogVGhlIHZhbHVlIG9mIHRoZSBub25jZSBDbGFpbSBNVVNUIGJlIGNoZWNrZWQgdG8gdmVyaWZ5IHRoYXQgaXQgaXMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIG9uZSB0aGF0IHdhcyBzZW50XHJcbi8vIGluIHRoZSBBdXRoZW50aWNhdGlvbiBSZXF1ZXN0LlRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoZSBub25jZSB2YWx1ZSBmb3IgcmVwbGF5IGF0dGFja3MuVGhlIHByZWNpc2UgbWV0aG9kIGZvciBkZXRlY3RpbmcgcmVwbGF5IGF0dGFja3NcclxuLy8gaXMgQ2xpZW50IHNwZWNpZmljLlxyXG4vL1xyXG4vLyBpZF90b2tlbiBDMTA6IElmIHRoZSBhY3IgQ2xhaW0gd2FzIHJlcXVlc3RlZCwgdGhlIENsaWVudCBTSE9VTEQgY2hlY2sgdGhhdCB0aGUgYXNzZXJ0ZWQgQ2xhaW0gVmFsdWUgaXMgYXBwcm9wcmlhdGUuXHJcbi8vIFRoZSBtZWFuaW5nIGFuZCBwcm9jZXNzaW5nIG9mIGFjciBDbGFpbSBWYWx1ZXMgaXMgb3V0IG9mIHNjb3BlIGZvciB0aGlzIGRvY3VtZW50LlxyXG4vL1xyXG4vLyBpZF90b2tlbiBDMTE6IFdoZW4gYSBtYXhfYWdlIHJlcXVlc3QgaXMgbWFkZSwgdGhlIENsaWVudCBTSE9VTEQgY2hlY2sgdGhlIGF1dGhfdGltZSBDbGFpbSB2YWx1ZSBhbmQgcmVxdWVzdCByZS0gYXV0aGVudGljYXRpb25cclxuLy8gaWYgaXQgZGV0ZXJtaW5lcyB0b28gbXVjaCB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IEVuZC0gVXNlciBhdXRoZW50aWNhdGlvbi5cclxuXHJcbi8vIEFjY2VzcyBUb2tlbiBWYWxpZGF0aW9uXHJcbi8vIGFjY2Vzc190b2tlbiBDMTogSGFzaCB0aGUgb2N0ZXRzIG9mIHRoZSBBU0NJSSByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWNjZXNzX3Rva2VuIHdpdGggdGhlIGhhc2ggYWxnb3JpdGhtIHNwZWNpZmllZCBpbiBKV0FbSldBXVxyXG4vLyBmb3IgdGhlIGFsZyBIZWFkZXIgUGFyYW1ldGVyIG9mIHRoZSBJRCBUb2tlbidzIEpPU0UgSGVhZGVyLiBGb3IgaW5zdGFuY2UsIGlmIHRoZSBhbGcgaXMgUlMyNTYsIHRoZSBoYXNoIGFsZ29yaXRobSB1c2VkIGlzIFNIQS0yNTYuXHJcbi8vIGFjY2Vzc190b2tlbiBDMjogVGFrZSB0aGUgbGVmdC0gbW9zdCBoYWxmIG9mIHRoZSBoYXNoIGFuZCBiYXNlNjR1cmwtIGVuY29kZSBpdC5cclxuLy8gYWNjZXNzX3Rva2VuIEMzOiBUaGUgdmFsdWUgb2YgYXRfaGFzaCBpbiB0aGUgSUQgVG9rZW4gTVVTVCBtYXRjaCB0aGUgdmFsdWUgcHJvZHVjZWQgaW4gdGhlIHByZXZpb3VzIHN0ZXAgaWYgYXRfaGFzaCBpcyBwcmVzZW50IGluIHRoZSBJRCBUb2tlbi5cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIE9pZGNTZWN1cml0eVZhbGlkYXRpb24ge1xyXG5cclxuICAgIHN0YXRpYyBSZWZyZXNoVG9rZW5Ob25jZVBsYWNlaG9sZGVyID0gJy0tUmVmcmVzaFRva2VuLS0nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgYXJyYXlIZWxwZXJTZXJ2aWNlOiBFcXVhbGl0eUhlbHBlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSB0b2tlbkhlbHBlclNlcnZpY2U6IFRva2VuSGVscGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2VcclxuICAgICkge31cclxuXHJcbiAgICAvLyBpZF90b2tlbiBDNzogVGhlIGN1cnJlbnQgdGltZSBNVVNUIGJlIGJlZm9yZSB0aGUgdGltZSByZXByZXNlbnRlZCBieSB0aGUgZXhwIENsYWltIChwb3NzaWJseSBhbGxvd2luZyBmb3Igc29tZSBzbWFsbCBsZWV3YXkgdG8gYWNjb3VudCBmb3IgY2xvY2sgc2tldykuXHJcbiAgICBpc1Rva2VuRXhwaXJlZCh0b2tlbjogc3RyaW5nLCBvZmZzZXRTZWNvbmRzPzogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGRlY29kZWQ6IGFueTtcclxuICAgICAgICBkZWNvZGVkID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbih0b2tlbiwgZmFsc2UpO1xyXG5cclxuICAgICAgICByZXR1cm4gIXRoaXMudmFsaWRhdGVfaWRfdG9rZW5fZXhwX25vdF9leHBpcmVkKGRlY29kZWQsIG9mZnNldFNlY29uZHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlkX3Rva2VuIEM3OiBUaGUgY3VycmVudCB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSB0aW1lIHJlcHJlc2VudGVkIGJ5IHRoZSBleHAgQ2xhaW0gKHBvc3NpYmx5IGFsbG93aW5nIGZvciBzb21lIHNtYWxsIGxlZXdheSB0byBhY2NvdW50IGZvciBjbG9jayBza2V3KS5cclxuICAgIHZhbGlkYXRlX2lkX3Rva2VuX2V4cF9ub3RfZXhwaXJlZChkZWNvZGVkX2lkX3Rva2VuOiBzdHJpbmcsIG9mZnNldFNlY29uZHM/OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25EYXRlID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uRGF0ZShkZWNvZGVkX2lkX3Rva2VuKTtcclxuICAgICAgICBvZmZzZXRTZWNvbmRzID0gb2Zmc2V0U2Vjb25kcyB8fCAwO1xyXG5cclxuICAgICAgICBpZiAoIXRva2VuRXhwaXJhdGlvbkRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uVmFsdWUgPSB0b2tlbkV4cGlyYXRpb25EYXRlLnZhbHVlT2YoKTtcclxuICAgICAgICBjb25zdCBub3dXaXRoT2Zmc2V0ID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgKyBvZmZzZXRTZWNvbmRzICogMTAwMDtcclxuICAgICAgICBjb25zdCB0b2tlbk5vdEV4cGlyZWQgPSB0b2tlbkV4cGlyYXRpb25WYWx1ZSA+IG5vd1dpdGhPZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgVG9rZW4gbm90IGV4cGlyZWQ/OiAke3Rva2VuRXhwaXJhdGlvblZhbHVlfSA+ICR7bm93V2l0aE9mZnNldH0gICgke3Rva2VuTm90RXhwaXJlZH0pYCk7XHJcblxyXG4gICAgICAgIC8vIFRva2VuIG5vdCBleHBpcmVkP1xyXG4gICAgICAgIHJldHVybiB0b2tlbk5vdEV4cGlyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaXNzXHJcbiAgICAvLyBSRVFVSVJFRC4gSXNzdWVyIElkZW50aWZpZXIgZm9yIHRoZSBJc3N1ZXIgb2YgdGhlIHJlc3BvbnNlLlRoZSBpc3MgdmFsdWUgaXMgYSBjYXNlLXNlbnNpdGl2ZSBVUkwgdXNpbmcgdGhlIGh0dHBzIHNjaGVtZSB0aGF0IGNvbnRhaW5zIHNjaGVtZSwgaG9zdCxcclxuICAgIC8vIGFuZCBvcHRpb25hbGx5LCBwb3J0IG51bWJlciBhbmQgcGF0aCBjb21wb25lbnRzIGFuZCBubyBxdWVyeSBvciBmcmFnbWVudCBjb21wb25lbnRzLlxyXG4gICAgLy9cclxuICAgIC8vIHN1YlxyXG4gICAgLy8gUkVRVUlSRUQuIFN1YmplY3QgSWRlbnRpZmllci5Mb2NhbGx5IHVuaXF1ZSBhbmQgbmV2ZXIgcmVhc3NpZ25lZCBpZGVudGlmaWVyIHdpdGhpbiB0aGUgSXNzdWVyIGZvciB0aGUgRW5kLSBVc2VyLFxyXG4gICAgLy8gd2hpY2ggaXMgaW50ZW5kZWQgdG8gYmUgY29uc3VtZWQgYnkgdGhlIENsaWVudCwgZS5nLiwgMjQ0MDAzMjAgb3IgQUl0T2F3bXd0V3djVDBrNTFCYXlld052dXRySlVxc3ZsNnFzN0E0LlxyXG4gICAgLy8gSXQgTVVTVCBOT1QgZXhjZWVkIDI1NSBBU0NJSSBjaGFyYWN0ZXJzIGluIGxlbmd0aC5UaGUgc3ViIHZhbHVlIGlzIGEgY2FzZS1zZW5zaXRpdmUgc3RyaW5nLlxyXG4gICAgLy9cclxuICAgIC8vIGF1ZFxyXG4gICAgLy8gUkVRVUlSRUQuIEF1ZGllbmNlKHMpIHRoYXQgdGhpcyBJRCBUb2tlbiBpcyBpbnRlbmRlZCBmb3IuIEl0IE1VU1QgY29udGFpbiB0aGUgT0F1dGggMi4wIGNsaWVudF9pZCBvZiB0aGUgUmVseWluZyBQYXJ0eSBhcyBhbiBhdWRpZW5jZSB2YWx1ZS5cclxuICAgIC8vIEl0IE1BWSBhbHNvIGNvbnRhaW4gaWRlbnRpZmllcnMgZm9yIG90aGVyIGF1ZGllbmNlcy5JbiB0aGUgZ2VuZXJhbCBjYXNlLCB0aGUgYXVkIHZhbHVlIGlzIGFuIGFycmF5IG9mIGNhc2Utc2Vuc2l0aXZlIHN0cmluZ3MuXHJcbiAgICAvLyBJbiB0aGUgY29tbW9uIHNwZWNpYWwgY2FzZSB3aGVuIHRoZXJlIGlzIG9uZSBhdWRpZW5jZSwgdGhlIGF1ZCB2YWx1ZSBNQVkgYmUgYSBzaW5nbGUgY2FzZS1zZW5zaXRpdmUgc3RyaW5nLlxyXG4gICAgLy9cclxuICAgIC8vIGV4cFxyXG4gICAgLy8gUkVRVUlSRUQuIEV4cGlyYXRpb24gdGltZSBvbiBvciBhZnRlciB3aGljaCB0aGUgSUQgVG9rZW4gTVVTVCBOT1QgYmUgYWNjZXB0ZWQgZm9yIHByb2Nlc3NpbmcuXHJcbiAgICAvLyBUaGUgcHJvY2Vzc2luZyBvZiB0aGlzIHBhcmFtZXRlciByZXF1aXJlcyB0aGF0IHRoZSBjdXJyZW50IGRhdGUvIHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIGV4cGlyYXRpb24gZGF0ZS8gdGltZSBsaXN0ZWQgaW4gdGhlIHZhbHVlLlxyXG4gICAgLy8gSW1wbGVtZW50ZXJzIE1BWSBwcm92aWRlIGZvciBzb21lIHNtYWxsIGxlZXdheSwgdXN1YWxseSBubyBtb3JlIHRoYW4gYSBmZXcgbWludXRlcywgdG8gYWNjb3VudCBmb3IgY2xvY2sgc2tldy5cclxuICAgIC8vIEl0cyB2YWx1ZSBpcyBhIEpTT04gW1JGQzcxNTldIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBzZWNvbmRzIGZyb20gMTk3MC0gMDEgLSAwMVQwMDogMDA6MDBaIGFzIG1lYXN1cmVkIGluIFVUQyB1bnRpbCB0aGUgZGF0ZS8gdGltZS5cclxuICAgIC8vIFNlZSBSRkMgMzMzOSBbUkZDMzMzOV0gZm9yIGRldGFpbHMgcmVnYXJkaW5nIGRhdGUvIHRpbWVzIGluIGdlbmVyYWwgYW5kIFVUQyBpbiBwYXJ0aWN1bGFyLlxyXG4gICAgLy9cclxuICAgIC8vIGlhdFxyXG4gICAgLy8gUkVRVUlSRUQuIFRpbWUgYXQgd2hpY2ggdGhlIEpXVCB3YXMgaXNzdWVkLiBJdHMgdmFsdWUgaXMgYSBKU09OIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBzZWNvbmRzIGZyb20gMTk3MC0gMDEgLSAwMVQwMDogMDA6MDBaIGFzIG1lYXN1cmVkXHJcbiAgICAvLyBpbiBVVEMgdW50aWwgdGhlIGRhdGUvIHRpbWUuXHJcbiAgICB2YWxpZGF0ZV9yZXF1aXJlZF9pZF90b2tlbihkYXRhSWRUb2tlbjogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZhbGlkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnaXNzJykpIHtcclxuICAgICAgICAgICAgdmFsaWRhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpc3MgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ3N1YicpKSB7XHJcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnc3ViIGlzIG1pc3NpbmcsIHRoaXMgaXMgcmVxdWlyZWQgaW4gdGhlIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWRhdGFJZFRva2VuLmhhc093blByb3BlcnR5KCdhdWQnKSkge1xyXG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1ZCBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnZXhwJykpIHtcclxuICAgICAgICAgICAgdmFsaWRhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdleHAgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2lhdCcpKSB7XHJcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnaWF0IGlzIG1pc3NpbmcsIHRoaXMgaXMgcmVxdWlyZWQgaW4gdGhlIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmFsaWRhdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlkX3Rva2VuIEM4OiBUaGUgaWF0IENsYWltIGNhbiBiZSB1c2VkIHRvIHJlamVjdCB0b2tlbnMgdGhhdCB3ZXJlIGlzc3VlZCB0b28gZmFyIGF3YXkgZnJvbSB0aGUgY3VycmVudCB0aW1lLFxyXG4gICAgLy8gbGltaXRpbmcgdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgbm9uY2VzIG5lZWQgdG8gYmUgc3RvcmVkIHRvIHByZXZlbnQgYXR0YWNrcy5UaGUgYWNjZXB0YWJsZSByYW5nZSBpcyBDbGllbnQgc3BlY2lmaWMuXHJcbiAgICB2YWxpZGF0ZV9pZF90b2tlbl9pYXRfbWF4X29mZnNldChkYXRhSWRUb2tlbjogYW55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4X29mZnNldF9hbGxvd2VkX2luX3NlY29uZHM6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVfaWF0X29mZnNldF92YWxpZGF0aW9uOiBib29sZWFuKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGlmIChkaXNhYmxlX2lhdF9vZmZzZXRfdmFsaWRhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2lhdCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGVUaW1lX2lhdF9pZF90b2tlbiA9IG5ldyBEYXRlKDApOyAvLyBUaGUgMCBoZXJlIGlzIHRoZSBrZXksIHdoaWNoIHNldHMgdGhlIGRhdGUgdG8gdGhlIGVwb2NoXHJcbiAgICAgICAgZGF0ZVRpbWVfaWF0X2lkX3Rva2VuLnNldFVUQ1NlY29uZHMoZGF0YUlkVG9rZW4uaWF0KTtcclxuXHJcbiAgICAgICAgbWF4X29mZnNldF9hbGxvd2VkX2luX3NlY29uZHMgPSBtYXhfb2Zmc2V0X2FsbG93ZWRfaW5fc2Vjb25kcyB8fCAwO1xyXG5cclxuICAgICAgICBpZiAoZGF0ZVRpbWVfaWF0X2lkX3Rva2VuID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgICAndmFsaWRhdGVfaWRfdG9rZW5faWF0X21heF9vZmZzZXQ6ICcgK1xyXG4gICAgICAgICAgICAgICAgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gZGF0ZVRpbWVfaWF0X2lkX3Rva2VuLnZhbHVlT2YoKSkgK1xyXG4gICAgICAgICAgICAgICAgJyA8ICcgK1xyXG4gICAgICAgICAgICAgICAgbWF4X29mZnNldF9hbGxvd2VkX2luX3NlY29uZHMgKiAxMDAwXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSBkYXRlVGltZV9pYXRfaWRfdG9rZW4udmFsdWVPZigpIDwgbWF4X29mZnNldF9hbGxvd2VkX2luX3NlY29uZHMgKiAxMDAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlkX3Rva2VuIEM5OiBUaGUgdmFsdWUgb2YgdGhlIG5vbmNlIENsYWltIE1VU1QgYmUgY2hlY2tlZCB0byB2ZXJpZnkgdGhhdCBpdCBpcyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgb25lXHJcbiAgICAvLyB0aGF0IHdhcyBzZW50IGluIHRoZSBBdXRoZW50aWNhdGlvbiBSZXF1ZXN0LlRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoZSBub25jZSB2YWx1ZSBmb3IgcmVwbGF5IGF0dGFja3MuXHJcbiAgICAvLyBUaGUgcHJlY2lzZSBtZXRob2QgZm9yIGRldGVjdGluZyByZXBsYXkgYXR0YWNrcyBpcyBDbGllbnQgc3BlY2lmaWMuXHJcbiAgICB2YWxpZGF0ZV9pZF90b2tlbl9ub25jZShkYXRhSWRUb2tlbjogYW55LCBsb2NhbF9ub25jZTogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgaXNGcm9tUmVmcmVzaFRva2VuID0gZGF0YUlkVG9rZW4ubm9uY2UgPT09IHVuZGVmaW5lZCAmJiBsb2NhbF9ub25jZSA9PT0gT2lkY1NlY3VyaXR5VmFsaWRhdGlvbi5SZWZyZXNoVG9rZW5Ob25jZVBsYWNlaG9sZGVyO1xyXG4gICAgICAgIGlmICghaXNGcm9tUmVmcmVzaFRva2VuICYmIGRhdGFJZFRva2VuLm5vbmNlICE9PSBsb2NhbF9ub25jZSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1ZhbGlkYXRlX2lkX3Rva2VuX25vbmNlIGZhaWxlZCwgZGF0YUlkVG9rZW4ubm9uY2U6ICcgKyBkYXRhSWRUb2tlbi5ub25jZSArICcgbG9jYWxfbm9uY2U6JyArIGxvY2FsX25vbmNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWRfdG9rZW4gQzE6IFRoZSBJc3N1ZXIgSWRlbnRpZmllciBmb3IgdGhlIE9wZW5JRCBQcm92aWRlciAod2hpY2ggaXMgdHlwaWNhbGx5IG9idGFpbmVkIGR1cmluZyBEaXNjb3ZlcnkpXHJcbiAgICAvLyBNVVNUIGV4YWN0bHkgbWF0Y2ggdGhlIHZhbHVlIG9mIHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0uXHJcbiAgICB2YWxpZGF0ZV9pZF90b2tlbl9pc3MoZGF0YUlkVG9rZW46IGFueSwgYXV0aFdlbGxLbm93bkVuZHBvaW50c19pc3N1ZXI6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgoZGF0YUlkVG9rZW4uaXNzIGFzIHN0cmluZykgIT09IChhdXRoV2VsbEtub3duRW5kcG9pbnRzX2lzc3VlciBhcyBzdHJpbmcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgICAgICAgICAgICdWYWxpZGF0ZV9pZF90b2tlbl9pc3MgZmFpbGVkLCBkYXRhSWRUb2tlbi5pc3M6ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFJZFRva2VuLmlzcyArXHJcbiAgICAgICAgICAgICAgICAgICAgJyBhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzc3VlcjonICtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoV2VsbEtub3duRW5kcG9pbnRzX2lzc3VlclxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZF90b2tlbiBDMjogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoYXQgdGhlIGF1ZCAoYXVkaWVuY2UpIENsYWltIGNvbnRhaW5zIGl0cyBjbGllbnRfaWQgdmFsdWUgcmVnaXN0ZXJlZCBhdCB0aGUgSXNzdWVyIGlkZW50aWZpZWRcclxuICAgIC8vIGJ5IHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0gYXMgYW4gYXVkaWVuY2UuXHJcbiAgICAvLyBUaGUgSUQgVG9rZW4gTVVTVCBiZSByZWplY3RlZCBpZiB0aGUgSUQgVG9rZW4gZG9lcyBub3QgbGlzdCB0aGUgQ2xpZW50IGFzIGEgdmFsaWQgYXVkaWVuY2UsIG9yIGlmIGl0IGNvbnRhaW5zIGFkZGl0aW9uYWwgYXVkaWVuY2VzXHJcbiAgICAvLyBub3QgdHJ1c3RlZCBieSB0aGUgQ2xpZW50LlxyXG4gICAgdmFsaWRhdGVfaWRfdG9rZW5fYXVkKGRhdGFJZFRva2VuOiBhbnksIGF1ZDogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGRhdGFJZFRva2VuLmF1ZCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuYXJyYXlIZWxwZXJTZXJ2aWNlLmFyZUVxdWFsKGRhdGFJZFRva2VuLmF1ZCwgYXVkKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1ZhbGlkYXRlX2lkX3Rva2VuX2F1ZCAgYXJyYXkgZmFpbGVkLCBkYXRhSWRUb2tlbi5hdWQ6ICcgKyBkYXRhSWRUb2tlbi5hdWQgKyAnIGNsaWVudF9pZDonICsgYXVkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhSWRUb2tlbi5hdWQgIT09IGF1ZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1ZhbGlkYXRlX2lkX3Rva2VuX2F1ZCBmYWlsZWQsIGRhdGFJZFRva2VuLmF1ZDogJyArIGRhdGFJZFRva2VuLmF1ZCArICcgY2xpZW50X2lkOicgKyBhdWQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGVTdGF0ZUZyb21IYXNoQ2FsbGJhY2soc3RhdGU6IGFueSwgbG9jYWxfc3RhdGU6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgoc3RhdGUgYXMgc3RyaW5nKSAhPT0gKGxvY2FsX3N0YXRlIGFzIHN0cmluZykpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdWYWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayBmYWlsZWQsIHN0YXRlOiAnICsgc3RhdGUgKyAnIGxvY2FsX3N0YXRlOicgKyBsb2NhbF9zdGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlX3VzZXJkYXRhX3N1Yl9pZF90b2tlbihpZF90b2tlbl9zdWI6IGFueSwgdXNlcmRhdGFfc3ViOiBhbnkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoKGlkX3Rva2VuX3N1YiBhcyBzdHJpbmcpICE9PSAodXNlcmRhdGFfc3ViIGFzIHN0cmluZykpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCd2YWxpZGF0ZV91c2VyZGF0YV9zdWJfaWRfdG9rZW4gZmFpbGVkLCBpZF90b2tlbl9zdWI6ICcgKyBpZF90b2tlbl9zdWIgKyAnIHVzZXJkYXRhX3N1YjonICsgdXNlcmRhdGFfc3ViKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWRfdG9rZW4gQzU6IFRoZSBDbGllbnQgTVVTVCB2YWxpZGF0ZSB0aGUgc2lnbmF0dXJlIG9mIHRoZSBJRCBUb2tlbiBhY2NvcmRpbmcgdG8gSldTIFtKV1NdIHVzaW5nIHRoZSBhbGdvcml0aG0gc3BlY2lmaWVkIGluIHRoZSBhbGdcclxuICAgIC8vIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIEpPU0UgSGVhZGVyLlRoZSBDbGllbnQgTVVTVCB1c2UgdGhlIGtleXMgcHJvdmlkZWQgYnkgdGhlIElzc3Vlci5cclxuICAgIC8vIGlkX3Rva2VuIEM2OiBUaGUgYWxnIHZhbHVlIFNIT1VMRCBiZSBSUzI1Ni4gVmFsaWRhdGlvbiBvZiB0b2tlbnMgdXNpbmcgb3RoZXIgc2lnbmluZyBhbGdvcml0aG1zIGlzIGRlc2NyaWJlZCBpbiB0aGVcclxuICAgIC8vIE9wZW5JRCBDb25uZWN0IENvcmUgMS4wIFtPcGVuSUQuQ29yZV0gc3BlY2lmaWNhdGlvbi5cclxuICAgIHZhbGlkYXRlX3NpZ25hdHVyZV9pZF90b2tlbihpZF90b2tlbjogYW55LCBqd3RrZXlzOiBhbnkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWp3dGtleXMgfHwgIWp3dGtleXMua2V5cykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBoZWFkZXJfZGF0YSA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldEhlYWRlckZyb21Ub2tlbihpZF90b2tlbiwgZmFsc2UpO1xyXG5cclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoaGVhZGVyX2RhdGEpLmxlbmd0aCA9PT0gMCAmJiBoZWFkZXJfZGF0YS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpZCB0b2tlbiBoYXMgbm8gaGVhZGVyIGRhdGEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qga2lkID0gaGVhZGVyX2RhdGEua2lkO1xyXG4gICAgICAgIGNvbnN0IGFsZyA9IGhlYWRlcl9kYXRhLmFsZztcclxuXHJcbiAgICAgICAgaWYgKCdSUzI1NicgIT09IChhbGcgYXMgc3RyaW5nKSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnT25seSBSUzI1NiBzdXBwb3J0ZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFoZWFkZXJfZGF0YS5oYXNPd25Qcm9wZXJ0eSgna2lkJykpIHtcclxuICAgICAgICAgICAgLy8gZXhhY3RseSAxIGtleSBpbiB0aGUgand0a2V5cyBhbmQgbm8ga2lkIGluIHRoZSBKb3NlIGhlYWRlclxyXG4gICAgICAgICAgICAvLyBrdHlcdFwiUlNBXCIgdXNlIFwic2lnXCJcclxuICAgICAgICAgICAgbGV0IGFtb3VudE9mTWF0Y2hpbmdLZXlzID0gMDtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygand0a2V5cy5rZXlzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGtleS5rdHkgYXMgc3RyaW5nKSA9PT0gJ1JTQScgJiYgKGtleS51c2UgYXMgc3RyaW5nKSA9PT0gJ3NpZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbW91bnRPZk1hdGNoaW5nS2V5cyA9IGFtb3VudE9mTWF0Y2hpbmdLZXlzICsgMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGFtb3VudE9mTWF0Y2hpbmdLZXlzID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnbm8ga2V5cyBmb3VuZCwgaW5jb3JyZWN0IFNpZ25hdHVyZSwgdmFsaWRhdGlvbiBmYWlsZWQgZm9yIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW1vdW50T2ZNYXRjaGluZ0tleXMgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnbm8gSUQgVG9rZW4ga2lkIGNsYWltIGluIEpPU0UgaGVhZGVyIGFuZCBtdWx0aXBsZSBzdXBwbGllZCBpbiBqd2tzX3VyaScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygand0a2V5cy5rZXlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKChrZXkua3R5IGFzIHN0cmluZykgPT09ICdSU0EnICYmIChrZXkudXNlIGFzIHN0cmluZykgPT09ICdzaWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHB1YmxpY2tleSA9IEtFWVVUSUwuZ2V0S2V5KGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBLSlVSLmp3cy5KV1MudmVyaWZ5KGlkX3Rva2VuLCBwdWJsaWNrZXksIFsnUlMyNTYnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luY29ycmVjdCBTaWduYXR1cmUsIHZhbGlkYXRpb24gZmFpbGVkIGZvciBpZF90b2tlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGtpZCBpbiB0aGUgSm9zZSBoZWFkZXIgb2YgaWRfdG9rZW5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygand0a2V5cy5rZXlzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGtleS5raWQgYXMgc3RyaW5nKSA9PT0gKGtpZCBhcyBzdHJpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHVibGlja2V5ID0gS0VZVVRJTC5nZXRLZXkoa2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkID0gS0pVUi5qd3MuSldTLnZlcmlmeShpZF90b2tlbiwgcHVibGlja2V5LCBbJ1JTMjU2J10pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnaW5jb3JyZWN0IFNpZ25hdHVyZSwgdmFsaWRhdGlvbiBmYWlsZWQgZm9yIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWdfdmFsaWRhdGVfcmVzcG9uc2VfdHlwZShyZXNwb25zZV90eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAocmVzcG9uc2VfdHlwZSA9PT0gJ2lkX3Rva2VuIHRva2VuJyB8fCByZXNwb25zZV90eXBlID09PSAnaWRfdG9rZW4nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlX3R5cGUgPT09ICdjb2RlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdtb2R1bGUgY29uZmlndXJlIGluY29ycmVjdCwgaW52YWxpZCByZXNwb25zZV90eXBlOicgKyByZXNwb25zZV90eXBlKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWNjZXB0cyBJRCBUb2tlbiB3aXRob3V0ICdraWQnIGNsYWltIGluIEpPU0UgaGVhZGVyIGlmIG9ubHkgb25lIEpXSyBzdXBwbGllZCBpbiAnandrc191cmwnXHJcbiAgICAvLy8vIHByaXZhdGUgdmFsaWRhdGVfbm9fa2lkX2luX2hlYWRlcl9vbmx5X29uZV9hbGxvd2VkX2luX2p3dGtleXMoaGVhZGVyX2RhdGE6IGFueSwgand0a2V5czogYW55KTogYm9vbGVhbiB7XHJcbiAgICAvLy8vICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmxvZ0RlYnVnKCdhbW91bnQgb2Ygand0a2V5cy5rZXlzOiAnICsgand0a2V5cy5rZXlzLmxlbmd0aCk7XHJcbiAgICAvLy8vICAgIGlmICghaGVhZGVyX2RhdGEuaGFzT3duUHJvcGVydHkoJ2tpZCcpKSB7XHJcbiAgICAvLy8vICAgICAgICAvLyBubyBraWQgZGVmaW5lZCBpbiBKb3NlIGhlYWRlclxyXG4gICAgLy8vLyAgICAgICAgaWYgKGp3dGtleXMua2V5cy5sZW5ndGggIT0gMSkge1xyXG4gICAgLy8vLyAgICAgICAgICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmxvZ0RlYnVnKCdqd3RrZXlzLmtleXMubGVuZ3RoICE9IDEgYW5kIG5vIGtpZCBpbiBoZWFkZXInKTtcclxuICAgIC8vLy8gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAvLy8vICAgICAgICB9XHJcbiAgICAvLy8vICAgIH1cclxuXHJcbiAgICAvLy8vICAgIHJldHVybiB0cnVlO1xyXG4gICAgLy8vLyB9XHJcblxyXG4gICAgLy8gQWNjZXNzIFRva2VuIFZhbGlkYXRpb25cclxuICAgIC8vIGFjY2Vzc190b2tlbiBDMTogSGFzaCB0aGUgb2N0ZXRzIG9mIHRoZSBBU0NJSSByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWNjZXNzX3Rva2VuIHdpdGggdGhlIGhhc2ggYWxnb3JpdGhtIHNwZWNpZmllZCBpbiBKV0FbSldBXVxyXG4gICAgLy8gZm9yIHRoZSBhbGcgSGVhZGVyIFBhcmFtZXRlciBvZiB0aGUgSUQgVG9rZW4ncyBKT1NFIEhlYWRlci4gRm9yIGluc3RhbmNlLCBpZiB0aGUgYWxnIGlzIFJTMjU2LCB0aGUgaGFzaCBhbGdvcml0aG0gdXNlZCBpcyBTSEEtMjU2LlxyXG4gICAgLy8gYWNjZXNzX3Rva2VuIEMyOiBUYWtlIHRoZSBsZWZ0LSBtb3N0IGhhbGYgb2YgdGhlIGhhc2ggYW5kIGJhc2U2NHVybC0gZW5jb2RlIGl0LlxyXG4gICAgLy8gYWNjZXNzX3Rva2VuIEMzOiBUaGUgdmFsdWUgb2YgYXRfaGFzaCBpbiB0aGUgSUQgVG9rZW4gTVVTVCBtYXRjaCB0aGUgdmFsdWUgcHJvZHVjZWQgaW4gdGhlIHByZXZpb3VzIHN0ZXAgaWYgYXRfaGFzaFxyXG4gICAgLy8gaXMgcHJlc2VudCBpbiB0aGUgSUQgVG9rZW4uXHJcbiAgICB2YWxpZGF0ZV9pZF90b2tlbl9hdF9oYXNoKGFjY2Vzc190b2tlbjogYW55LCBhdF9oYXNoOiBhbnksIGlzQ29kZUZsb3c6IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F0X2hhc2ggZnJvbSB0aGUgc2VydmVyOicgKyBhdF9oYXNoKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGF0X2hhc2ggaXMgb3B0aW9uYWwgZm9yIHRoZSBjb2RlIGZsb3dcclxuICAgICAgICBpZiAoaXNDb2RlRmxvdykge1xyXG4gICAgICAgICAgICBpZiAoIShhdF9oYXNoIGFzIHN0cmluZykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQ29kZSBGbG93IGFjdGl2ZSwgYW5kIG5vIGF0X2hhc2ggaW4gdGhlIGlkX3Rva2VuLCBza2lwcGluZyBjaGVjayEnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0ZXN0ZGF0YSA9IHRoaXMuZ2VuZXJhdGVfYXRfaGFzaCgnJyArIGFjY2Vzc190b2tlbik7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdF9oYXNoIGNsaWVudCB2YWxpZGF0aW9uIG5vdCBkZWNvZGVkOicgKyB0ZXN0ZGF0YSk7XHJcbiAgICAgICAgaWYgKHRlc3RkYXRhID09PSAoYXRfaGFzaCBhcyBzdHJpbmcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBpc1ZhbGlkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHRoaXMuZ2VuZXJhdGVfYXRfaGFzaCgnJyArIGRlY29kZVVSSUNvbXBvbmVudChhY2Nlc3NfdG9rZW4pKTtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCctZ2VuIGFjY2Vzcy0tJyArIHRlc3RWYWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICh0ZXN0VmFsdWUgPT09IChhdF9oYXNoIGFzIHN0cmluZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBpc1ZhbGlkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdlbmVyYXRlX2F0X2hhc2goYWNjZXNzX3Rva2VuOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGhhc2ggPSBLSlVSLmNyeXB0by5VdGlsLmhhc2hTdHJpbmcoYWNjZXNzX3Rva2VuLCAnc2hhMjU2Jyk7XHJcbiAgICAgICAgY29uc3QgZmlyc3QxMjhiaXRzID0gaGFzaC5zdWJzdHIoMCwgaGFzaC5sZW5ndGggLyAyKTtcclxuICAgICAgICBjb25zdCB0ZXN0ZGF0YSA9IGhleHRvYjY0dShmaXJzdDEyOGJpdHMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGVzdGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgZ2VuZXJhdGVfY29kZV92ZXJpZmllcihjb2RlX2NoYWxsZW5nZTogYW55KTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBoYXNoID0gS0pVUi5jcnlwdG8uVXRpbC5oYXNoU3RyaW5nKGNvZGVfY2hhbGxlbmdlLCAnc2hhMjU2Jyk7XHJcbiAgICAgICAgY29uc3QgdGVzdGRhdGEgPSBoZXh0b2I2NHUoaGFzaCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0ZXN0ZGF0YTtcclxuICAgIH1cclxufVxyXG4iXX0=