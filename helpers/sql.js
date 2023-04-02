const { BadRequestError } = require('../expressError');

/**
 * Helper for making selective update queries.
 * 
 * This can be used to make the SET clause of an SQL update statement.
 * 
 * dataToUpdate => {field1: newValue, field2: newValue, ...}
 * jsToSql => { itemName: "item_name", itemDesc: "item_desc"... }
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");

    //{itemName: 'Egg Noodle Soup_test'} => ['"item_name"=$1']
    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );

    return {
        setCols: cols.join(', '),
        values: Object.values(dataToUpdate)
    };
}

module.exports = { sqlForPartialUpdate };