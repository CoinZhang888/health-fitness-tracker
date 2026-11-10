import {sqliteTable,text,primaryKey} from 'drizzle-orm/sqlite-core';
export const users=sqliteTable('users',{id:text('id').primaryKey(),email:text('email')});
export const records=sqliteTable('records',{id:text('id').notNull(),userId:text('user_id').notNull(),kind:text('kind').notNull(),date:text('date').notNull(),data:text('data').notNull()},t=>[primaryKey({columns:[t.userId,t.id]})]);
export const goals=sqliteTable('goals',{userId:text('user_id').primaryKey(),data:text('data').notNull()});
