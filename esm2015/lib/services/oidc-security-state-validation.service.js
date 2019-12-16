/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { ValidateStateResult } from '../models/validate-state-result.model';
import { ValidationResult } from '../models/validation-result.enum';
import { ConfigurationProvider } from './auth-configuration.provider';
import { TokenHelperService } from './oidc-token-helper.service';
import { LoggerService } from './oidc.logger.service';
import { OidcSecurityCommon } from './oidc.security.common';
import { OidcSecurityValidation } from './oidc.security.validation';
export class StateValidationService {
    /**
     * @param {?} oidcSecurityCommon
     * @param {?} oidcSecurityValidation
     * @param {?} tokenHelperService
     * @param {?} loggerService
     * @param {?} configurationProvider
     */
    constructor(oidcSecurityCommon, oidcSecurityValidation, tokenHelperService, loggerService, configurationProvider) {
        this.oidcSecurityCommon = oidcSecurityCommon;
        this.oidcSecurityValidation = oidcSecurityValidation;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
    }
    /**
     * @param {?} result
     * @param {?} jwtKeys
     * @return {?}
     */
    validateState(result, jwtKeys) {
        /** @type {?} */
        const toReturn = new ValidateStateResult();
        if (!this.oidcSecurityValidation.validateStateFromHashCallback(result.state, this.oidcSecurityCommon.authStateControl)) {
            this.loggerService.logWarning('authorizedCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        if (this.configurationProvider.openIDConfiguration.response_type === 'id_token token' ||
            this.configurationProvider.openIDConfiguration.response_type === 'code') {
            toReturn.access_token = result.access_token;
        }
        if (result.id_token) {
            toReturn.id_token = result.id_token;
            toReturn.decoded_id_token = this.tokenHelperService.getPayloadFromToken(toReturn.id_token, false);
            if (!this.oidcSecurityValidation.validate_signature_id_token(toReturn.id_token, jwtKeys)) {
                this.loggerService.logDebug('authorizedCallback Signature validation failed id_token');
                toReturn.state = ValidationResult.SignatureFailed;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.oidcSecurityValidation.validate_id_token_nonce(toReturn.decoded_id_token, this.oidcSecurityCommon.authNonce)) {
                this.loggerService.logWarning('authorizedCallback incorrect nonce');
                toReturn.state = ValidationResult.IncorrectNonce;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.oidcSecurityValidation.validate_required_id_token(toReturn.decoded_id_token)) {
                this.loggerService.logDebug('authorizedCallback Validation, one of the REQUIRED properties missing from id_token');
                toReturn.state = ValidationResult.RequiredPropertyMissing;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.oidcSecurityValidation.validate_id_token_iat_max_offset(toReturn.decoded_id_token, this.configurationProvider.openIDConfiguration.max_id_token_iat_offset_allowed_in_seconds, this.configurationProvider.openIDConfiguration.disable_iat_offset_validation)) {
                this.loggerService.logWarning('authorizedCallback Validation, iat rejected id_token was issued too far away from the current time');
                toReturn.state = ValidationResult.MaxOffsetExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (this.configurationProvider.wellKnownEndpoints) {
                if (this.configurationProvider.openIDConfiguration.iss_validation_off) {
                    this.loggerService.logDebug('iss validation is turned off, this is not recommended!');
                }
                else if (!this.configurationProvider.openIDConfiguration.iss_validation_off &&
                    !this.oidcSecurityValidation.validate_id_token_iss(toReturn.decoded_id_token, this.configurationProvider.wellKnownEndpoints.issuer)) {
                    this.loggerService.logWarning('authorizedCallback incorrect iss does not match authWellKnownEndpoints issuer');
                    toReturn.state = ValidationResult.IssDoesNotMatchIssuer;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
            }
            else {
                this.loggerService.logWarning('authWellKnownEndpoints is undefined');
                toReturn.state = ValidationResult.NoAuthWellKnownEndPoints;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.oidcSecurityValidation.validate_id_token_aud(toReturn.decoded_id_token, this.configurationProvider.openIDConfiguration.client_id)) {
                this.loggerService.logWarning('authorizedCallback incorrect aud');
                toReturn.state = ValidationResult.IncorrectAud;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.oidcSecurityValidation.validate_id_token_exp_not_expired(toReturn.decoded_id_token)) {
                this.loggerService.logWarning('authorizedCallback token expired');
                toReturn.state = ValidationResult.TokenExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
        }
        else {
            this.loggerService.logDebug('No id_token found, skipping id_token validation');
        }
        // flow id_token token
        if (this.configurationProvider.openIDConfiguration.response_type !== 'id_token token' &&
            this.configurationProvider.openIDConfiguration.response_type !== 'code') {
            toReturn.authResponseIsValid = true;
            toReturn.state = ValidationResult.Ok;
            this.handleSuccessfulValidation();
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        if (!this.oidcSecurityValidation.validate_id_token_at_hash(toReturn.access_token, toReturn.decoded_id_token.at_hash, this.configurationProvider.openIDConfiguration.response_type === 'code') ||
            !toReturn.access_token) {
            this.loggerService.logWarning('authorizedCallback incorrect at_hash');
            toReturn.state = ValidationResult.IncorrectAtHash;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        toReturn.authResponseIsValid = true;
        toReturn.state = ValidationResult.Ok;
        this.handleSuccessfulValidation();
        return toReturn;
    }
    /**
     * @private
     * @return {?}
     */
    handleSuccessfulValidation() {
        this.oidcSecurityCommon.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.auto_clean_state_after_authentication) {
            this.oidcSecurityCommon.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    }
    /**
     * @private
     * @return {?}
     */
    handleUnsuccessfulValidation() {
        this.oidcSecurityCommon.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.auto_clean_state_after_authentication) {
            this.oidcSecurityCommon.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    }
}
StateValidationService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
StateValidationService.ctorParameters = () => [
    { type: OidcSecurityCommon },
    { type: OidcSecurityValidation },
    { type: TokenHelperService },
    { type: LoggerService },
    { type: ConfigurationProvider }
];
if (false) {
    /** @type {?} */
    StateValidationService.prototype.oidcSecurityCommon;
    /**
     * @type {?}
     * @private
     */
    StateValidationService.prototype.oidcSecurityValidation;
    /**
     * @type {?}
     * @private
     */
    StateValidationService.prototype.tokenHelperService;
    /**
     * @type {?}
     * @private
     */
    StateValidationService.prototype.loggerService;
    /**
     * @type {?}
     * @private
     */
    StateValidationService.prototype.configurationProvider;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy1zZWN1cml0eS1zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvc2VydmljZXMvb2lkYy1zZWN1cml0eS1zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDcEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDdEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBR3BFLE1BQU0sT0FBTyxzQkFBc0I7Ozs7Ozs7O0lBQy9CLFlBQ1csa0JBQXNDLEVBQ3JDLHNCQUE4QyxFQUM5QyxrQkFBc0MsRUFDdEMsYUFBNEIsRUFDbkIscUJBQTRDO1FBSnRELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDckMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQ25CLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7SUFDN0QsQ0FBQzs7Ozs7O0lBRUwsYUFBYSxDQUFDLE1BQVcsRUFBRSxPQUFnQjs7Y0FDakMsUUFBUSxHQUFHLElBQUksbUJBQW1CLEVBQUU7UUFDMUMs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bmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBKd3RLZXlzIH0gZnJvbSAnLi4vbW9kZWxzL2p3dGtleXMnO1xyXG5pbXBvcnQgeyBWYWxpZGF0ZVN0YXRlUmVzdWx0IH0gZnJvbSAnLi4vbW9kZWxzL3ZhbGlkYXRlLXN0YXRlLXJlc3VsdC5tb2RlbCc7XHJcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi9tb2RlbHMvdmFsaWRhdGlvbi1yZXN1bHQuZW51bSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4vYXV0aC1jb25maWd1cmF0aW9uLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vb2lkYy5sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IE9pZGNTZWN1cml0eUNvbW1vbiB9IGZyb20gJy4vb2lkYy5zZWN1cml0eS5jb21tb24nO1xyXG5pbXBvcnQgeyBPaWRjU2VjdXJpdHlWYWxpZGF0aW9uIH0gZnJvbSAnLi9vaWRjLnNlY3VyaXR5LnZhbGlkYXRpb24nO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgU3RhdGVWYWxpZGF0aW9uU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgb2lkY1NlY3VyaXR5Q29tbW9uOiBPaWRjU2VjdXJpdHlDb21tb24sXHJcbiAgICAgICAgcHJpdmF0ZSBvaWRjU2VjdXJpdHlWYWxpZGF0aW9uOiBPaWRjU2VjdXJpdHlWYWxpZGF0aW9uLFxyXG4gICAgICAgIHByaXZhdGUgdG9rZW5IZWxwZXJTZXJ2aWNlOiBUb2tlbkhlbHBlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXJcclxuICAgICkgeyB9XHJcblxyXG4gICAgdmFsaWRhdGVTdGF0ZShyZXN1bHQ6IGFueSwgand0S2V5czogSnd0S2V5cyk6IFZhbGlkYXRlU3RhdGVSZXN1bHQge1xyXG4gICAgICAgIGNvbnN0IHRvUmV0dXJuID0gbmV3IFZhbGlkYXRlU3RhdGVSZXN1bHQoKTtcclxuICAgICAgICBpZiAoIXRoaXMub2lkY1NlY3VyaXR5VmFsaWRhdGlvbi52YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhyZXN1bHQuc3RhdGUsIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmF1dGhTdGF0ZUNvbnRyb2wpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IHN0YXRlJyk7XHJcbiAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5TdGF0ZXNEb05vdE1hdGNoO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnJlc3BvbnNlX3R5cGUgPT09ICdpZF90b2tlbiB0b2tlbicgfHxcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5yZXNwb25zZV90eXBlID09PSAnY29kZSdcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdG9SZXR1cm4uYWNjZXNzX3Rva2VuID0gcmVzdWx0LmFjY2Vzc190b2tlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQuaWRfdG9rZW4pIHtcclxuICAgICAgICAgICAgdG9SZXR1cm4uaWRfdG9rZW4gPSByZXN1bHQuaWRfdG9rZW47XHJcblxyXG4gICAgICAgICAgICB0b1JldHVybi5kZWNvZGVkX2lkX3Rva2VuID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbih0b1JldHVybi5pZF90b2tlbiwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9pZGNTZWN1cml0eVZhbGlkYXRpb24udmFsaWRhdGVfc2lnbmF0dXJlX2lkX3Rva2VuKHRvUmV0dXJuLmlkX3Rva2VuLCBqd3RLZXlzKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2sgU2lnbmF0dXJlIHZhbGlkYXRpb24gZmFpbGVkIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuU2lnbmF0dXJlRmFpbGVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vaWRjU2VjdXJpdHlWYWxpZGF0aW9uLnZhbGlkYXRlX2lkX3Rva2VuX25vbmNlKHRvUmV0dXJuLmRlY29kZWRfaWRfdG9rZW4sIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmF1dGhOb25jZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IG5vbmNlJyk7XHJcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0Tm9uY2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9pZGNTZWN1cml0eVZhbGlkYXRpb24udmFsaWRhdGVfcmVxdWlyZWRfaWRfdG9rZW4odG9SZXR1cm4uZGVjb2RlZF9pZF90b2tlbikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXV0aG9yaXplZENhbGxiYWNrIFZhbGlkYXRpb24sIG9uZSBvZiB0aGUgUkVRVUlSRUQgcHJvcGVydGllcyBtaXNzaW5nIGZyb20gaWRfdG9rZW4nKTtcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5SZXF1aXJlZFByb3BlcnR5TWlzc2luZztcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAhdGhpcy5vaWRjU2VjdXJpdHlWYWxpZGF0aW9uLnZhbGlkYXRlX2lkX3Rva2VuX2lhdF9tYXhfb2Zmc2V0KFxyXG4gICAgICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRfaWRfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5tYXhfaWRfdG9rZW5faWF0X29mZnNldF9hbGxvd2VkX2luX3NlY29uZHMsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5kaXNhYmxlX2lhdF9vZmZzZXRfdmFsaWRhdGlvblxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgVmFsaWRhdGlvbiwgaWF0IHJlamVjdGVkIGlkX3Rva2VuIHdhcyBpc3N1ZWQgdG9vIGZhciBhd2F5IGZyb20gdGhlIGN1cnJlbnQgdGltZScpO1xyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk1heE9mZnNldEV4cGlyZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaXNzX3ZhbGlkYXRpb25fb2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdpc3MgdmFsaWRhdGlvbiBpcyB0dXJuZWQgb2ZmLCB0aGlzIGlzIG5vdCByZWNvbW1lbmRlZCEnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaXNzX3ZhbGlkYXRpb25fb2ZmICYmXHJcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMub2lkY1NlY3VyaXR5VmFsaWRhdGlvbi52YWxpZGF0ZV9pZF90b2tlbl9pc3MoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRfaWRfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cy5pc3N1ZXIpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBpc3MgZG9lcyBub3QgbWF0Y2ggYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpc3N1ZXInKTtcclxuICAgICAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSXNzRG9lc05vdE1hdGNoSXNzdWVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk5vQXV0aFdlbGxLbm93bkVuZFBvaW50cztcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMub2lkY1NlY3VyaXR5VmFsaWRhdGlvbi52YWxpZGF0ZV9pZF90b2tlbl9hdWQoXHJcbiAgICAgICAgICAgICAgICB0b1JldHVybi5kZWNvZGVkX2lkX3Rva2VuLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5jbGllbnRfaWQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBhdWQnKTtcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBdWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9pZGNTZWN1cml0eVZhbGlkYXRpb24udmFsaWRhdGVfaWRfdG9rZW5fZXhwX25vdF9leHBpcmVkKHRvUmV0dXJuLmRlY29kZWRfaWRfdG9rZW4pKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIHRva2VuIGV4cGlyZWQnKTtcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5Ub2tlbkV4cGlyZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnTm8gaWRfdG9rZW4gZm91bmQsIHNraXBwaW5nIGlkX3Rva2VuIHZhbGlkYXRpb24nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZsb3cgaWRfdG9rZW4gdG9rZW5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ucmVzcG9uc2VfdHlwZSAhPT0gJ2lkX3Rva2VuIHRva2VuJyAmJlxyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnJlc3BvbnNlX3R5cGUgIT09ICdjb2RlJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0b1JldHVybi5hdXRoUmVzcG9uc2VJc1ZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk9rO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICF0aGlzLm9pZGNTZWN1cml0eVZhbGlkYXRpb24udmFsaWRhdGVfaWRfdG9rZW5fYXRfaGFzaChcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLmFjY2Vzc190b2tlbixcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRfaWRfdG9rZW4uYXRfaGFzaCxcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ucmVzcG9uc2VfdHlwZSA9PT0gJ2NvZGUnXHJcbiAgICAgICAgICAgICkgfHxcclxuICAgICAgICAgICAgIXRvUmV0dXJuLmFjY2Vzc190b2tlblxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBhdF9oYXNoJyk7XHJcbiAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBdEhhc2g7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0b1JldHVybi5hdXRoUmVzcG9uc2VJc1ZhbGlkID0gdHJ1ZTtcclxuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuT2s7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCkge1xyXG4gICAgICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmF1dGhOb25jZSA9ICcnO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5hdXRvX2NsZWFuX3N0YXRlX2FmdGVyX2F1dGhlbnRpY2F0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmF1dGhTdGF0ZUNvbnRyb2wgPSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdBdXRob3JpemVkQ2FsbGJhY2sgdG9rZW4ocykgdmFsaWRhdGVkLCBjb250aW51ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpIHtcclxuICAgICAgICB0aGlzLm9pZGNTZWN1cml0eUNvbW1vbi5hdXRoTm9uY2UgPSAnJztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0b19jbGVhbl9zdGF0ZV9hZnRlcl9hdXRoZW50aWNhdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLm9pZGNTZWN1cml0eUNvbW1vbi5hdXRoU3RhdGVDb250cm9sID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplZENhbGxiYWNrIHRva2VuKHMpIGludmFsaWQnKTtcclxuICAgIH1cclxufVxyXG4iXX0=