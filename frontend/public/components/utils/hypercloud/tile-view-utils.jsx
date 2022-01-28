import * as React from 'react';
import * as _ from 'lodash-es';

export const clearItemsFromCategories = categories => {
  _.forOwn(categories, category => {
    category.numItems = 0;
    category.items = [];
  });
};

export const processCategories = (categories, itemsSorter) => {
  _.forOwn(categories, category => {
    if (category.items) {
      category.numItems = _.size(category.items);
      category.items = itemsSorter(category.items);
    }
  });
};

const isCategoryEmpty = ({ items }) => _.isEmpty(items);

const addItem = (item, category) => {
  // Add the item to the category
  if (!category.items) {
    category.items = [item];
  } else if (!category.items.includes(item)) {
    category.items = category.items.concat(item);
  }
};

export const pruneCategoriesWithNoItems = categories => {
  if (!categories) {
    return;
  }

  _.forOwn(categories, (category, key) => {
    if (isCategoryEmpty(category)) {
      delete categories[key];
    }
  });
};

export const categorize = (items, categories) => {
  // Categorize each item
  _.each(items, item => {
    let itemCategorized = false;

    _.each(categories, category => {
      const matchedCategories = filterCategories(category, item);
      _.each(matchedCategories, category => {
        addItem(item, category);
        itemCategorized = true;
      });
    });
    if (!itemCategorized) {
      let values = _.get(item, 'categories');
      if (!Array.isArray(values)) {
        values = [values];
      }
      values?.forEach(value => {
        if (!!value) {
          if (!categories[value]) {
            categories[value] = { id: value, label: value };
          }
          addItem(item, categories[value]);
        }
      });
      //   addItem(item, categories.other);
    }
  });

  categories.all.numItems = _.size(items);
  categories.all.items = items;
};

const filterCategories = (category, item) => {
  if (!category.values) {
    return [];
  }

  let values = _.get(item, 'categories');
  if (!Array.isArray(values)) {
    values = [values];
  }

  const intersection = [category.values, values].reduce((a, b) => a.filter(c => b.includes(c)));
  if (!_.isEmpty(intersection)) {
    return [category];
  }

  return [];
};
