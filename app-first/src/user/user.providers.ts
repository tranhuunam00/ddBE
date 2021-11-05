
import { Connection } from 'mongoose';
import { TokenSchema } from './scheme/token.schema';
import { UserSchema } from './scheme/user.schema';


export const usersProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) => connection.model('users', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const tokenProviders=[
  {
    provide: "TOKEN_MODEL",
    useFactory: (connection: Connection) => connection.model('tokens', TokenSchema),
    inject: ['DATABASE_CONNECTION'],
  }
]