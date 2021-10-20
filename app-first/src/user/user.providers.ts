
import { Connection } from 'mongoose';
import { UserSchema } from './scheme/user.schema';


export const usersProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) => connection.model('users', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];