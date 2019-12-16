/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PlatformProvider } from './platform.provider';
import * as i0 from "@angular/core";
import * as i1 from "./platform.provider";
export class ConfigurationProvider {
    /**
     * @param {?} platformProvider
     */
    constructor(platformProvider) {
        this.platformProvider = platformProvider;
        this.DEFAULT_CONFIG = {
            stsServer: 'https://please_set',
            redirect_url: 'https://please_set',
            client_id: 'please_set',
            response_type: 'code',
            scope: 'openid email profile',
            hd_param: '',
            post_logout_redirect_uri: 'https://please_set',
            start_checksession: false,
            silent_renew: false,
            silent_renew_url: 'https://please_set',
            silent_renew_offset_in_seconds: 0,
            use_refresh_token: false,
            post_login_route: '/',
            forbidden_route: '/forbidden',
            unauthorized_route: '/unauthorized',
            auto_userinfo: true,
            auto_clean_state_after_authentication: true,
            trigger_authorization_result_event: false,
            log_console_warning_active: true,
            log_console_debug_active: false,
            iss_validation_off: false,
            history_cleanup_off: false,
            max_id_token_iat_offset_allowed_in_seconds: 3,
            isauthorizedrace_timeout_in_seconds: 5,
            disable_iat_offset_validation: false,
            storage: typeof Storage !== 'undefined' ? sessionStorage : null,
        };
        this.INITIAL_AUTHWELLKNOWN = {
            issuer: '',
            jwks_uri: '',
            authorization_endpoint: '',
            token_endpoint: '',
            userinfo_endpoint: '',
            end_session_endpoint: '',
            check_session_iframe: '',
            revocation_endpoint: '',
            introspection_endpoint: '',
        };
        this.mergedOpenIdConfiguration = this.DEFAULT_CONFIG;
        this.authWellKnownEndpoints = this.INITIAL_AUTHWELLKNOWN;
        this.onConfigurationChangeInternal = new Subject();
    }
    /**
     * @return {?}
     */
    get openIDConfiguration() {
        return this.mergedOpenIdConfiguration;
    }
    /**
     * @return {?}
     */
    get wellKnownEndpoints() {
        return this.authWellKnownEndpoints;
    }
    /**
     * @return {?}
     */
    get onConfigurationChange() {
        return this.onConfigurationChangeInternal.asObservable();
    }
    /**
     * @param {?} passedOpenIfConfiguration
     * @param {?} passedAuthWellKnownEndpoints
     * @return {?}
     */
    setup(passedOpenIfConfiguration, passedAuthWellKnownEndpoints) {
        this.mergedOpenIdConfiguration = Object.assign({}, this.mergedOpenIdConfiguration, passedOpenIfConfiguration);
        this.setSpecialCases(this.mergedOpenIdConfiguration);
        this.authWellKnownEndpoints = Object.assign({}, passedAuthWellKnownEndpoints);
        this.onConfigurationChangeInternal.next(Object.assign({}, this.mergedOpenIdConfiguration));
    }
    /**
     * @private
     * @param {?} currentConfig
     * @return {?}
     */
    setSpecialCases(currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.start_checksession = false;
            currentConfig.silent_renew = false;
            currentConfig.use_refresh_token = false;
        }
    }
}
ConfigurationProvider.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
ConfigurationProvider.ctorParameters = () => [
    { type: PlatformProvider }
];
/** @nocollapse */ ConfigurationProvider.ngInjectableDef = i0.defineInjectable({ factory: function ConfigurationProvider_Factory() { return new ConfigurationProvider(i0.inject(i1.PlatformProvider)); }, token: ConfigurationProvider, providedIn: "root" });
if (false) {
    /**
     * @type {?}
     * @private
     */
    ConfigurationProvider.prototype.DEFAULT_CONFIG;
    /**
     * @type {?}
     * @private
     */
    ConfigurationProvider.prototype.INITIAL_AUTHWELLKNOWN;
    /**
     * @type {?}
     * @private
     */
    ConfigurationProvider.prototype.mergedOpenIdConfiguration;
    /**
     * @type {?}
     * @private
     */
    ConfigurationProvider.prototype.authWellKnownEndpoints;
    /**
     * @type {?}
     * @private
     */
    ConfigurationProvider.prototype.onConfigurationChangeInternal;
    /**
     * @type {?}
     * @private
     */
    ConfigurationProvider.prototype.platformProvider;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1jb25maWd1cmF0aW9uLnByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3NlcnZpY2VzL2F1dGgtY29uZmlndXJhdGlvbi5wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRy9CLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7QUFHdkQsTUFBTSxPQUFPLHFCQUFxQjs7OztJQTJEOUIsWUFBb0IsZ0JBQWtDO1FBQWxDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUExRDlDLG1CQUFjLEdBQWdDO1lBQ2xELFNBQVMsRUFBRSxvQkFBb0I7WUFDL0IsWUFBWSxFQUFFLG9CQUFvQjtZQUNsQyxTQUFTLEVBQUUsWUFBWTtZQUN2QixhQUFhLEVBQUUsTUFBTTtZQUNyQixLQUFLLEVBQUUsc0JBQXNCO1lBQzdCLFFBQVEsRUFBRSxFQUFFO1lBQ1osd0JBQXdCLEVBQUUsb0JBQW9CO1lBQzlDLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsWUFBWSxFQUFFLEtBQUs7WUFDbkIsZ0JBQWdCLEVBQUUsb0JBQW9CO1lBQ3RDLDhCQUE4QixFQUFFLENBQUM7WUFDakMsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixnQkFBZ0IsRUFBRSxHQUFHO1lBQ3JCLGVBQWUsRUFBRSxZQUFZO1lBQzdCLGtCQUFrQixFQUFFLGVBQWU7WUFDbkMsYUFBYSxFQUFFLElBQUk7WUFDbkIscUNBQXFDLEVBQUUsSUFBSTtZQUMzQyxrQ0FBa0MsRUFBRSxLQUFLO1lBQ3pDLDBCQUEwQixFQUFFLElBQUk7WUFDaEMsd0JBQXdCLEVBQUUsS0FBSztZQUMvQixrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsMENBQTBDLEVBQUUsQ0FBQztZQUM3QyxtQ0FBbUMsRUFBRSxDQUFDO1lBQ3RDLDZCQUE2QixFQUFFLEtBQUs7WUFDcEMsT0FBTyxFQUFFLE9BQU8sT0FBTyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJO1NBQ2xFLENBQUM7UUFFTSwwQkFBcUIsR0FBMkI7WUFDcEQsTUFBTSxFQUFFLEVBQUU7WUFDVixRQUFRLEVBQUUsRUFBRTtZQUNaLHNCQUFzQixFQUFFLEVBQUU7WUFDMUIsY0FBYyxFQUFFLEVBQUU7WUFDbEIsaUJBQWlCLEVBQUUsRUFBRTtZQUNyQixvQkFBb0IsRUFBRSxFQUFFO1lBQ3hCLG9CQUFvQixFQUFFLEVBQUU7WUFDeEIsbUJBQW1CLEVBQUUsRUFBRTtZQUN2QixzQkFBc0IsRUFBRSxFQUFFO1NBQzdCLENBQUM7UUFFTSw4QkFBeUIsR0FBZ0MsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM3RSwyQkFBc0IsR0FBMkIsSUFBSSxDQUFDLHFCQUFxQixDQUFDO1FBRTVFLGtDQUE2QixHQUFHLElBQUksT0FBTyxFQUF1QixDQUFDO0lBY2xCLENBQUM7Ozs7SUFaMUQsSUFBSSxtQkFBbUI7UUFDbkIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUM7SUFDMUMsQ0FBQzs7OztJQUVELElBQUksa0JBQWtCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDO0lBQ3ZDLENBQUM7Ozs7SUFFRCxJQUFJLHFCQUFxQjtRQUNyQixPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM3RCxDQUFDOzs7Ozs7SUFJRCxLQUFLLENBQ0QseUJBQWlFLEVBQ2pFLDRCQUF1RTtRQUV2RSxJQUFJLENBQUMseUJBQXlCLHFCQUFRLElBQUksQ0FBQyx5QkFBeUIsRUFBSyx5QkFBeUIsQ0FBRSxDQUFDO1FBQ3JHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLHNCQUFzQixxQkFBUSw0QkFBNEIsQ0FBRSxDQUFDO1FBQ2xFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLG1CQUFNLElBQUksQ0FBQyx5QkFBeUIsRUFBRyxDQUFDO0lBQ25GLENBQUM7Ozs7OztJQUVPLGVBQWUsQ0FBQyxhQUFrQztRQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRTtZQUNsQyxhQUFhLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1lBQ3pDLGFBQWEsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ25DLGFBQWEsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7U0FDM0M7SUFDTCxDQUFDOzs7WUE5RUosVUFBVSxTQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7OztZQUZ6QixnQkFBZ0I7Ozs7Ozs7O0lBSXJCLCtDQTJCRTs7Ozs7SUFFRixzREFVRTs7Ozs7SUFFRiwwREFBcUY7Ozs7O0lBQ3JGLHVEQUFvRjs7Ozs7SUFFcEYsOERBQTJFOzs7OztJQWMvRCxpREFBMEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiwgT3BlbklkSW50ZXJuYWxDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vbW9kZWxzL2F1dGguY29uZmlndXJhdGlvbic7XHJcbmltcG9ydCB7IEF1dGhXZWxsS25vd25FbmRwb2ludHMgfSBmcm9tICcuLi9tb2RlbHMvYXV0aC53ZWxsLWtub3duLWVuZHBvaW50cyc7XHJcbmltcG9ydCB7IFBsYXRmb3JtUHJvdmlkZXIgfSBmcm9tICcuL3BsYXRmb3JtLnByb3ZpZGVyJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uUHJvdmlkZXIge1xyXG4gICAgcHJpdmF0ZSBERUZBVUxUX0NPTkZJRzogT3BlbklkSW50ZXJuYWxDb25maWd1cmF0aW9uID0ge1xyXG4gICAgICAgIHN0c1NlcnZlcjogJ2h0dHBzOi8vcGxlYXNlX3NldCcsXHJcbiAgICAgICAgcmVkaXJlY3RfdXJsOiAnaHR0cHM6Ly9wbGVhc2Vfc2V0JyxcclxuICAgICAgICBjbGllbnRfaWQ6ICdwbGVhc2Vfc2V0JyxcclxuICAgICAgICByZXNwb25zZV90eXBlOiAnY29kZScsXHJcbiAgICAgICAgc2NvcGU6ICdvcGVuaWQgZW1haWwgcHJvZmlsZScsXHJcbiAgICAgICAgaGRfcGFyYW06ICcnLFxyXG4gICAgICAgIHBvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaTogJ2h0dHBzOi8vcGxlYXNlX3NldCcsXHJcbiAgICAgICAgc3RhcnRfY2hlY2tzZXNzaW9uOiBmYWxzZSxcclxuICAgICAgICBzaWxlbnRfcmVuZXc6IGZhbHNlLFxyXG4gICAgICAgIHNpbGVudF9yZW5ld191cmw6ICdodHRwczovL3BsZWFzZV9zZXQnLFxyXG4gICAgICAgIHNpbGVudF9yZW5ld19vZmZzZXRfaW5fc2Vjb25kczogMCxcclxuICAgICAgICB1c2VfcmVmcmVzaF90b2tlbjogZmFsc2UsXHJcbiAgICAgICAgcG9zdF9sb2dpbl9yb3V0ZTogJy8nLFxyXG4gICAgICAgIGZvcmJpZGRlbl9yb3V0ZTogJy9mb3JiaWRkZW4nLFxyXG4gICAgICAgIHVuYXV0aG9yaXplZF9yb3V0ZTogJy91bmF1dGhvcml6ZWQnLFxyXG4gICAgICAgIGF1dG9fdXNlcmluZm86IHRydWUsXHJcbiAgICAgICAgYXV0b19jbGVhbl9zdGF0ZV9hZnRlcl9hdXRoZW50aWNhdGlvbjogdHJ1ZSxcclxuICAgICAgICB0cmlnZ2VyX2F1dGhvcml6YXRpb25fcmVzdWx0X2V2ZW50OiBmYWxzZSxcclxuICAgICAgICBsb2dfY29uc29sZV93YXJuaW5nX2FjdGl2ZTogdHJ1ZSxcclxuICAgICAgICBsb2dfY29uc29sZV9kZWJ1Z19hY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgIGlzc192YWxpZGF0aW9uX29mZjogZmFsc2UsXHJcbiAgICAgICAgaGlzdG9yeV9jbGVhbnVwX29mZjogZmFsc2UsXHJcbiAgICAgICAgbWF4X2lkX3Rva2VuX2lhdF9vZmZzZXRfYWxsb3dlZF9pbl9zZWNvbmRzOiAzLFxyXG4gICAgICAgIGlzYXV0aG9yaXplZHJhY2VfdGltZW91dF9pbl9zZWNvbmRzOiA1LFxyXG4gICAgICAgIGRpc2FibGVfaWF0X29mZnNldF92YWxpZGF0aW9uOiBmYWxzZSxcclxuICAgICAgICBzdG9yYWdlOiB0eXBlb2YgU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgPyBzZXNzaW9uU3RvcmFnZSA6IG51bGwsXHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgSU5JVElBTF9BVVRIV0VMTEtOT1dOOiBBdXRoV2VsbEtub3duRW5kcG9pbnRzID0ge1xyXG4gICAgICAgIGlzc3VlcjogJycsXHJcbiAgICAgICAgandrc191cmk6ICcnLFxyXG4gICAgICAgIGF1dGhvcml6YXRpb25fZW5kcG9pbnQ6ICcnLFxyXG4gICAgICAgIHRva2VuX2VuZHBvaW50OiAnJyxcclxuICAgICAgICB1c2VyaW5mb19lbmRwb2ludDogJycsXHJcbiAgICAgICAgZW5kX3Nlc3Npb25fZW5kcG9pbnQ6ICcnLFxyXG4gICAgICAgIGNoZWNrX3Nlc3Npb25faWZyYW1lOiAnJyxcclxuICAgICAgICByZXZvY2F0aW9uX2VuZHBvaW50OiAnJyxcclxuICAgICAgICBpbnRyb3NwZWN0aW9uX2VuZHBvaW50OiAnJyxcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBtZXJnZWRPcGVuSWRDb25maWd1cmF0aW9uOiBPcGVuSWRJbnRlcm5hbENvbmZpZ3VyYXRpb24gPSB0aGlzLkRFRkFVTFRfQ09ORklHO1xyXG4gICAgcHJpdmF0ZSBhdXRoV2VsbEtub3duRW5kcG9pbnRzOiBBdXRoV2VsbEtub3duRW5kcG9pbnRzID0gdGhpcy5JTklUSUFMX0FVVEhXRUxMS05PV047XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ3VyYXRpb25DaGFuZ2VJbnRlcm5hbCA9IG5ldyBTdWJqZWN0PE9wZW5JZENvbmZpZ3VyYXRpb24+KCk7XHJcblxyXG4gICAgZ2V0IG9wZW5JRENvbmZpZ3VyYXRpb24oKTogT3BlbklkSW50ZXJuYWxDb25maWd1cmF0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXJnZWRPcGVuSWRDb25maWd1cmF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB3ZWxsS25vd25FbmRwb2ludHMoKTogQXV0aFdlbGxLbm93bkVuZHBvaW50cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aFdlbGxLbm93bkVuZHBvaW50cztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Db25maWd1cmF0aW9uQ2hhbmdlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9uQ29uZmlndXJhdGlvbkNoYW5nZUludGVybmFsLmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGxhdGZvcm1Qcm92aWRlcjogUGxhdGZvcm1Qcm92aWRlcikge31cclxuXHJcbiAgICBzZXR1cChcclxuICAgICAgICBwYXNzZWRPcGVuSWZDb25maWd1cmF0aW9uOiBPcGVuSWRDb25maWd1cmF0aW9uIHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgICAgICBwYXNzZWRBdXRoV2VsbEtub3duRW5kcG9pbnRzOiBBdXRoV2VsbEtub3duRW5kcG9pbnRzIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5tZXJnZWRPcGVuSWRDb25maWd1cmF0aW9uID0geyAuLi50aGlzLm1lcmdlZE9wZW5JZENvbmZpZ3VyYXRpb24sIC4uLnBhc3NlZE9wZW5JZkNvbmZpZ3VyYXRpb24gfTtcclxuICAgICAgICB0aGlzLnNldFNwZWNpYWxDYXNlcyh0aGlzLm1lcmdlZE9wZW5JZENvbmZpZ3VyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuYXV0aFdlbGxLbm93bkVuZHBvaW50cyA9IHsgLi4ucGFzc2VkQXV0aFdlbGxLbm93bkVuZHBvaW50cyB9O1xyXG4gICAgICAgIHRoaXMub25Db25maWd1cmF0aW9uQ2hhbmdlSW50ZXJuYWwubmV4dCh7IC4uLnRoaXMubWVyZ2VkT3BlbklkQ29uZmlndXJhdGlvbiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFNwZWNpYWxDYXNlcyhjdXJyZW50Q29uZmlnOiBPcGVuSWRDb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBsYXRmb3JtUHJvdmlkZXIuaXNCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb25maWcuc3RhcnRfY2hlY2tzZXNzaW9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb25maWcuc2lsZW50X3JlbmV3ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb25maWcudXNlX3JlZnJlc2hfdG9rZW4gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19