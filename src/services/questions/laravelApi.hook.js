const errors = require('@feathersjs/errors');

module.exports = {
  parseQuery,
  formatPagination
};

function parseQuery() {
  return async function(context) {
    let { query = {} } = context.params;
    if (query.page) {
      query.$skip = (query.page - 1) * (query.$limit || 10);
      delete query.page;
    }
    if (query.$sort && typeof query.$sort !== 'object') {
      query.$sort = formatSort(query.$sort);
    } else {
      query.$sort = {
        createdOn: -1
      };
    }
    if (query.$search) {
      query.$text = {
        $search: query.$search
      };
      delete query.$search;
    }
    return context;
  };
}

function formatPagination() {
  return async function(context) {
    const { limit, total, skip, data } = context.result;
    let current_page = Math.floor(skip / limit) + 1;
    let last_page = Math.ceil(total / limit);
    let from = skip + 1;
    let to =
      (total - skip) / limit >= 1 ? skip + limit : (total - skip) % limit;
    let per_page = limit;
    if (context.params && context.params.headers && context.params.query) {
      const url = context.params.headers.origin;
      const query = context.params.query;
      const nextPageQuery = Object.assign({}, query, {
        $skip: query.skip + query.limit
      });
      const prevPageQuery = Object.assign({}, query, {
        $skip: query.skip + query.limit
      });
      const next_page_url =
        url + '/questions' + objectToQuerystring(nextPageQuery);
      const prev_page_url =
        url + '/questions' + objectToQuerystring(prevPageQuery);
      const dispatch = {
        from,
        to,
        current_page,
        last_page,
        per_page,
        next_page_url,
        prev_page_url,
        limit,
        skip,
        total,
        data
      };
      context.dispatch = dispatch;
    }
    return context;
  };
}

function objectToQuerystring(obj) {
  return Object.keys(obj).reduce(function(str, key, i) {
    var delimiter, val;
    delimiter = i === 0 ? '?' : '&';
    key = encodeURIComponent(key);
    val = encodeURIComponent(obj[key]);
    return [str, delimiter, key, '=', val].join('');
  }, '');
}

function formatSort(expression) {
  let sortregex = /^(createdOn|sequence|displayName)(\|)(asc|dsc)$/i;
  let sort;
  let match = sortregex.exec(expression);
  if (match && match[3] === 'dsc') {
    sort = { [match[1]]: -1 };
  } else if (match && match[3] === 'asc') {
    sort = { [match[1]]: 1 };
  } else {
    sort = { createdOn: -1 };
  }
  return sort;
}
