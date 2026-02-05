exports.up = function up(knex) {
  return knex.schema.createTable('healthcheck_events', (table) => {
    table.increments('id').primary();
    table.string('status').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('healthcheck_events');
};
