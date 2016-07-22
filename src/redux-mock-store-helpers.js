import configureMockStore from 'redux-mock-store';

let mockStore = configureMockStore();

let store;

export function setupMockStoreWithMiddlewares(middlewares) {
  mockStore = configureMockStore(middlewares);
}

export function givenState(state) {
  store = mockStore(state);
}

export function whenDispatching(action) {
  store.dispatch(action);
}

export function thenNoActionsWereDispatched() {
  expect(store.getActions()).to.be.empty();
}

export function thenActionsWereDispatched(actions) {
  const storeActions = store.getActions();
  actions.forEach((a) => expect(storeActions).to.contain(a));
}
