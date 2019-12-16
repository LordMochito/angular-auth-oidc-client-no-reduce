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
var StateValidationService = /** @class */ (function () {
    function StateValidationService(oidcSecurityCommon, oidcSecurityValidation, tokenHelperService, loggerService, configurationProvider) {
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
    StateValidationService.prototype.validateState = /**
     * @param {?} result
     * @param {?} jwtKeys
     * @return {?}
     */
    function (result, jwtKeys) {
        /** @type {?} */
        var toReturn = new ValidateStateResult();
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
    };
    /**
     * @private
     * @return {?}
     */
    StateValidationService.prototype.handleSuccessfulValidation = /**
     * @private
     * @return {?}
     */
    function () {
        this.oidcSecurityCommon.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.auto_clean_state_after_authentication) {
            this.oidcSecurityCommon.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    };
    /**
     * @private
     * @return {?}
     */
    StateValidationService.prototype.handleUnsuccessfulValidation = /**
     * @private
     * @return {?}
     */
    function () {
        this.oidcSecurityCommon.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.auto_clean_state_after_authentication) {
            this.oidcSecurityCommon.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    };
    StateValidationService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    StateValidationService.ctorParameters = function () { return [
        { type: OidcSecurityCommon },
        { type: OidcSecurityValidation },
        { type: TokenHelperService },
        { type: LoggerService },
        { type: ConfigurationProvider }
    ]; };
    return StateValidationService;
}());
export { StateValidationService };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy1zZWN1cml0eS1zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvc2VydmljZXMvb2lkYy1zZWN1cml0eS1zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDcEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDdEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXBFO0lBRUksZ0NBQ1csa0JBQXNDLEVBQ3JDLHNCQUE4QyxFQUM5QyxrQkFBc0MsRUFDdEMsYUFBNEIsRUFDbkIscUJBQTRDO1FBSnRELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDckMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQ25CLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7SUFDN0QsQ0FBQzs7Ozs7O0lBRUwsOENBQWE7Ozs7O0lBQWIsVUFBYyxNQUFXLEVBQUUsT0FBZ0I7O1lBQ2pDLFFBQVEsR0FBRyxJQUFJLG1CQUFtQixFQUFFO1FBQzFDLElBQUksQ0FBQyxJQUFJ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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEp3dEtleXMgfSBmcm9tICcuLi9tb2RlbHMvand0a2V5cyc7XHJcbmltcG9ydCB7IFZhbGlkYXRlU3RhdGVSZXN1bHQgfSBmcm9tICcuLi9tb2RlbHMvdmFsaWRhdGUtc3RhdGUtcmVzdWx0Lm1vZGVsJztcclxuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL21vZGVscy92YWxpZGF0aW9uLXJlc3VsdC5lbnVtJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9hdXRoLWNvbmZpZ3VyYXRpb24ucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL29pZGMtdG9rZW4taGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9vaWRjLmxvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgT2lkY1NlY3VyaXR5Q29tbW9uIH0gZnJvbSAnLi9vaWRjLnNlY3VyaXR5LmNvbW1vbic7XHJcbmltcG9ydCB7IE9pZGNTZWN1cml0eVZhbGlkYXRpb24gfSBmcm9tICcuL29pZGMuc2VjdXJpdHkudmFsaWRhdGlvbic7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBvaWRjU2VjdXJpdHlDb21tb246IE9pZGNTZWN1cml0eUNvbW1vbixcclxuICAgICAgICBwcml2YXRlIG9pZGNTZWN1cml0eVZhbGlkYXRpb246IE9pZGNTZWN1cml0eVZhbGlkYXRpb24sXHJcbiAgICAgICAgcHJpdmF0ZSB0b2tlbkhlbHBlclNlcnZpY2U6IFRva2VuSGVscGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlclxyXG4gICAgKSB7IH1cclxuXHJcbiAgICB2YWxpZGF0ZVN0YXRlKHJlc3VsdDogYW55LCBqd3RLZXlzOiBKd3RLZXlzKTogVmFsaWRhdGVTdGF0ZVJlc3VsdCB7XHJcbiAgICAgICAgY29uc3QgdG9SZXR1cm4gPSBuZXcgVmFsaWRhdGVTdGF0ZVJlc3VsdCgpO1xyXG4gICAgICAgIGlmICghdGhpcy5vaWRjU2VjdXJpdHlWYWxpZGF0aW9uLnZhbGlkYXRlU3RhdGVGcm9tSGFzaENhbGxiYWNrKHJlc3VsdC5zdGF0ZSwgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24uYXV0aFN0YXRlQ29udHJvbCkpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3Qgc3RhdGUnKTtcclxuICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlN0YXRlc0RvTm90TWF0Y2g7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ucmVzcG9uc2VfdHlwZSA9PT0gJ2lkX3Rva2VuIHRva2VuJyB8fFxyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnJlc3BvbnNlX3R5cGUgPT09ICdjb2RlJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0b1JldHVybi5hY2Nlc3NfdG9rZW4gPSByZXN1bHQuYWNjZXNzX3Rva2VuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdC5pZF90b2tlbikge1xyXG4gICAgICAgICAgICB0b1JldHVybi5pZF90b2tlbiA9IHJlc3VsdC5pZF90b2tlbjtcclxuXHJcbiAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRfaWRfdG9rZW4gPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKHRvUmV0dXJuLmlkX3Rva2VuLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMub2lkY1NlY3VyaXR5VmFsaWRhdGlvbi52YWxpZGF0ZV9zaWduYXR1cmVfaWRfdG9rZW4odG9SZXR1cm4uaWRfdG9rZW4sIGp3dEtleXMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F1dGhvcml6ZWRDYWxsYmFjayBTaWduYXR1cmUgdmFsaWRhdGlvbiBmYWlsZWQgaWRfdG9rZW4nKTtcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5TaWduYXR1cmVGYWlsZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9pZGNTZWN1cml0eVZhbGlkYXRpb24udmFsaWRhdGVfaWRfdG9rZW5fbm9uY2UodG9SZXR1cm4uZGVjb2RlZF9pZF90b2tlbiwgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24uYXV0aE5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3Qgbm9uY2UnKTtcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3ROb25jZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMub2lkY1NlY3VyaXR5VmFsaWRhdGlvbi52YWxpZGF0ZV9yZXF1aXJlZF9pZF90b2tlbih0b1JldHVybi5kZWNvZGVkX2lkX3Rva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2sgVmFsaWRhdGlvbiwgb25lIG9mIHRoZSBSRVFVSVJFRCBwcm9wZXJ0aWVzIG1pc3NpbmcgZnJvbSBpZF90b2tlbicpO1xyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlJlcXVpcmVkUHJvcGVydHlNaXNzaW5nO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICF0aGlzLm9pZGNTZWN1cml0eVZhbGlkYXRpb24udmFsaWRhdGVfaWRfdG9rZW5faWF0X21heF9vZmZzZXQoXHJcbiAgICAgICAgICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZF9pZF90b2tlbixcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLm1heF9pZF90b2tlbl9pYXRfb2Zmc2V0X2FsbG93ZWRfaW5fc2Vjb25kcyxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmRpc2FibGVfaWF0X29mZnNldF92YWxpZGF0aW9uXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBWYWxpZGF0aW9uLCBpYXQgcmVqZWN0ZWQgaWRfdG9rZW4gd2FzIGlzc3VlZCB0b28gZmFyIGF3YXkgZnJvbSB0aGUgY3VycmVudCB0aW1lJyk7XHJcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuTWF4T2Zmc2V0RXhwaXJlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5pc3NfdmFsaWRhdGlvbl9vZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2lzcyB2YWxpZGF0aW9uIGlzIHR1cm5lZCBvZmYsIHRoaXMgaXMgbm90IHJlY29tbWVuZGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5pc3NfdmFsaWRhdGlvbl9vZmYgJiZcclxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5vaWRjU2VjdXJpdHlWYWxpZGF0aW9uLnZhbGlkYXRlX2lkX3Rva2VuX2lzcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZF9pZF90b2tlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzLmlzc3VlcilcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IGlzcyBkb2VzIG5vdCBtYXRjaCBhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzc3VlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5Jc3NEb2VzTm90TWF0Y2hJc3N1ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuTm9BdXRoV2VsbEtub3duRW5kUG9pbnRzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vaWRjU2VjdXJpdHlWYWxpZGF0aW9uLnZhbGlkYXRlX2lkX3Rva2VuX2F1ZChcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRfaWRfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmNsaWVudF9pZCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IGF1ZCcpO1xyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF1ZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMub2lkY1NlY3VyaXR5VmFsaWRhdGlvbi52YWxpZGF0ZV9pZF90b2tlbl9leHBfbm90X2V4cGlyZWQodG9SZXR1cm4uZGVjb2RlZF9pZF90b2tlbikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgdG9rZW4gZXhwaXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlRva2VuRXhwaXJlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdObyBpZF90b2tlbiBmb3VuZCwgc2tpcHBpbmcgaWRfdG9rZW4gdmFsaWRhdGlvbicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZmxvdyBpZF90b2tlbiB0b2tlblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5yZXNwb25zZV90eXBlICE9PSAnaWRfdG9rZW4gdG9rZW4nICYmXHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ucmVzcG9uc2VfdHlwZSAhPT0gJ2NvZGUnXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRvUmV0dXJuLmF1dGhSZXNwb25zZUlzVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuT2s7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgIXRoaXMub2lkY1NlY3VyaXR5VmFsaWRhdGlvbi52YWxpZGF0ZV9pZF90b2tlbl9hdF9oYXNoKFxyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uYWNjZXNzX3Rva2VuLFxyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZF9pZF90b2tlbi5hdF9oYXNoLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5yZXNwb25zZV90eXBlID09PSAnY29kZSdcclxuICAgICAgICAgICAgKSB8fFxyXG4gICAgICAgICAgICAhdG9SZXR1cm4uYWNjZXNzX3Rva2VuXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IGF0X2hhc2gnKTtcclxuICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF0SGFzaDtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRvUmV0dXJuLmF1dGhSZXNwb25zZUlzVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5PaztcclxuICAgICAgICB0aGlzLmhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlU3VjY2Vzc2Z1bFZhbGlkYXRpb24oKSB7XHJcbiAgICAgICAgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24uYXV0aE5vbmNlID0gJyc7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmF1dG9fY2xlYW5fc3RhdGVfYWZ0ZXJfYXV0aGVudGljYXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24uYXV0aFN0YXRlQ29udHJvbCA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0F1dGhvcml6ZWRDYWxsYmFjayB0b2tlbihzKSB2YWxpZGF0ZWQsIGNvbnRpbnVlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCkge1xyXG4gICAgICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmF1dGhOb25jZSA9ICcnO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5hdXRvX2NsZWFuX3N0YXRlX2FmdGVyX2F1dGhlbnRpY2F0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmF1dGhTdGF0ZUNvbnRyb2wgPSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdBdXRob3JpemVkQ2FsbGJhY2sgdG9rZW4ocykgaW52YWxpZCcpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==