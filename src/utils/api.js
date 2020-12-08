import { stringify as qs } from "querystring";

import {API_BASE_PATH} from "../config";


const api = {
  auth: {
    token: credentials => post("/token/", credentials),
    tokenRefresh: tokens => post("/token/refresh/", tokens),
  },

  containerKinds: {
    list: () => get("/container-kinds/"),
  },

  containers: {
    get: id => get(`/containers/${id}`),
    list: () => get("/containers/list_root"),
    listExport: () => get("/containers/list_export/", {format: "csv"}),
    listParents: id => get(`/containers/${id}/list_parents/`),
    listChildren: id => get(`/containers/${id}/list_children/`),
    listSamples: id => get(`/containers/${id}/list_samples/`),
    summary: () => get("/containers/summary"),
    template: {
      actions: () => get(`/containers/template_actions/`),
      check:  (action, template) => post(`/containers/template_check/`, form({ action, template })),
      submit: (action, template) => post(`/containers/template_submit/`, form({ action, template })),
    },
  },

  individuals: {
    get: individualId => get(`/individuals/${individualId}`),
    list: (page = {}) => get("/individuals/", page),
    listExport: () => get("/individuals/list_export/", {format: "csv"}),
  },

  samples: {
    get: sampleId => get(`/samples/${sampleId}`),
    list: (page = {}) => get("/samples/", page),
    listExport: () => get("/samples/list_export/", {format: "csv"}),
    listVersions: sampleId => get(`/samples/${sampleId}/versions`),
    summary: () => get("/samples/summary"),
    template: {
      actions: () => get(`/samples/template_actions/`),
      check:  (action, template) => post(`/samples/template_check/`, form({ action, template })),
      submit: (action, template) => post(`/samples/template_submit/`, form({ action, template })),
    },
  },

  users: {
    list: () => get("/users/"),
    listVersions: userId => get(`/versions?revision__user=${userId}&limit=999999`), // TODO: handle versions?
  },

  query: {
    search: q => get("/query/search/", { q }),
  },
};


export default api;

export function withToken(token, fn) {
  return (...args) => fn(...args)(undefined, () => ({ auth: { tokens: { access: token } } }))
}


function apiFetch(method, route, body) {
  return (_, getState) => {

    const accessToken = getState().auth.tokens.access;

    const headers = {}

    if (accessToken)
      headers["authorization"] = `Bearer ${accessToken}`

    if (!isFormData(body) && isObject(body))
      headers["content-type"] = "application/json"

    return fetch(`${API_BASE_PATH}${route}`, {
      method,
      headers,
      credentials: 'omit',
      body:
        isFormData(body) ?
          body :
        isObject(body) ?
          JSON.stringify(body) :
          undefined,
    })
    .then(attachData)
    .then(response => {
      if (response.ok) {
        return response;
      }
      return Promise.reject(createAPIError(response));
    })
  };
}

function get(route, queryParams) {
  return apiFetch('GET', route + (queryParams ? '?' + qs(queryParams) : ''), undefined);
}

function post(route, body) {
  return apiFetch('POST', route, body);
}


function createAPIError(response) {
  const data = response.data;

  let detail;
  try {
    detail = data.detail ||
      (data.revision__user && ('User: ' + data.revision__user.join(', ')));
  } catch (_) {}

  const message = detail ?
    ('API error: ' + detail) :
    (`HTTP error ${response.status}: ` + response.statusText + ': ' + response.url)

  const error = new Error(message);
  error.fromAPI = Boolean(detail);
  error.url = response.url;
  error.status = response.status;
  error.statusText = response.statusText;
  error.stack = []

  return error;
}

function attachData(response) {
  let contentType = response.headers.get('Content-Type') || '' ;
  return (contentType.includes('text/csv') ? response.text() : response.json())
  .then(data => {
    response.data = data;
    return response;
  })
  .catch(() => {
    response.data = {};
    return response;
  })
}

function form(params) {
  const formData = new FormData()
  for (let key in params) {
    const value = params[key]
    formData.append(key, value)
  }
  return formData
}

function isObject(object) {
  return object !== null && typeof object === 'object'
}

function isFormData(object) {
  return object instanceof FormData
}
