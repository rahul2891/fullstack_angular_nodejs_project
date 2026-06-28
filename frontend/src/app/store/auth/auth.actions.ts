import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, RegisterRequest, User } from '../../core/models/domain.models';

export const AuthActions = createActionGroup({
    source: 'Auth',
    events: {
       Login: props<{ payload: LoginRequest }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),

    Register: props<{ payload: RegisterRequest }>(),
    'Register Success': props<{ user: User }>(),
    'Register Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    }
})