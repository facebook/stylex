import { render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';

import './app/root.css';
import { Document } from '@/app/Document';
import { setCommonHeaders } from '@/app/headers';
import { Home } from '@/app/pages/Home';

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    // setup ctx here
    ctx;
  },
  render(Document, [route('/', Home)]),
]);
