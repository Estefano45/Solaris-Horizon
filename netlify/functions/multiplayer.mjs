import * as app from 'firebase-admin/app';
import * as auth from 'firebase-admin/auth';
import * as database from 'firebase-admin/database';
import service from '../../multiplayer-service.cjs';
service.setAdminModules({app,auth,database});
export const config={path:['/api/multiplayer/config','/api/multiplayer/session','/api/multiplayer/create','/api/multiplayer/room','/api/multiplayer/command']};
export default request=>service.handle(request);
