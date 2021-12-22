
import { Connection } from 'mongoose';
import { NotifiSchema } from './scheme/Notifi.schema';


export const NotifisProviders = [
  {
    provide: 'NOTIFI_MODEL',
    useFactory: (connection: Connection) => connection.model('notifis', NotifiSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];