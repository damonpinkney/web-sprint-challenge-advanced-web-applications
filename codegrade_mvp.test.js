import React from 'react';
import { render, fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { setupServer, getHandlers } from './backend/mock-server';
import { st } from './backend/helpers';
import App from './frontend/components/App';

jest.setTimeout(750); // Set shorter timeout for Codegrade

const waitForOptions = { timeout: 150 };
const queryOptions = { exact: false };

// Utility to render app and reset state
const renderApp = (ui) => {
  window.localStorage.clear();
  window.history.pushState({}, 'Test page', '/');
  return render(ui);
};

let server;
beforeAll(() => {
  server = setupServer(...getHandlers());
  server.listen();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  renderApp(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});

afterEach(() => {
  server.resetHandlers(...getHandlers());
});

// Element selectors
const token = () => window.localStorage.getItem('token');
const logoutBtn = () => screen.queryByText('Logout from app');
const usernameInput = () => screen.queryByPlaceholderText('Enter username');
const passwordInput = () => screen.queryByPlaceholderText('Enter password');
const loginBtn = () => screen.queryByText('Submit credentials');
const articlesLink = () => screen.queryByRole('link', { name: 'Articles' });
const titleInput = () => screen.queryByPlaceholderText('Enter title');
const textInput = () => screen.queryByPlaceholderText('Enter text');
const topicSelect = () => screen.queryByRole('combobox');
const submitArticleBtn = () => screen.queryByText('Submit');

// Utility for logging in
const loginFlow = async () => {
  fireEvent.change(usernameInput(), { target: { value: 'Foo' } });
  fireEvent.change(passwordInput(), { target: { value: '12345678' } });
  fireEvent.click(loginBtn());
  await screen.findByText(st.closuresTitle, queryOptions, waitForOptions);
  await screen.findByText('Here are your articles, Foo!', queryOptions, waitForOptions);
};

// Test cases
describe('Advanced Applications', () => {
  describe('Login', () => {
    test('[1] Login button enabled only when input valid', () => {
      expect(loginBtn()).toBeDisabled();
      fireEvent.change(usernameInput(), { target: { value: ' 12 ' } });
      fireEvent.change(passwordInput(), { target: { value: ' 1234567 ' } });
      expect(loginBtn()).toBeDisabled();
      fireEvent.change(usernameInput(), { target: { value: ' 123 ' } });
      fireEvent.change(passwordInput(), { target: { value: ' 12345678 ' } });
      expect(loginBtn()).toBeEnabled();
    });

    test('[2] Attempting to navigate to Articles redirects to login', () => {
      fireEvent.click(articlesLink());
      expect(titleInput()).not.toBeInTheDocument();
      expect(usernameInput()).toBeInTheDocument();
    });

    test('[3] Successful login displays articles and success message', async () => {
      fireEvent.change(usernameInput(), { target: { value: 'Foo' } });
      fireEvent.change(passwordInput(), { target: { value: '12345678' } });
      fireEvent.click(loginBtn('Submit credentials'));
      expect(screen.queryByText(st.closuresTitle, queryOptions)).not.toBeInTheDocument();
      await screen.findByText(st.closuresTitle, queryOptions, waitForOptions);
      await screen.findByText('Here are your articles, Foo!', queryOptions, waitForOptions);
    });
  });

  describe('Logout', () => {
    test('[4] Logout redirects to login and clears token', async () => {
      await loginFlow();
      expect(token()).not.toBeNull();
      fireEvent.click(logoutBtn());
      await screen.findByText('Goodbye!', queryOptions, waitForOptions);
      expect(token()).toBeNull();
      await screen.findByPlaceholderText('Enter username', queryOptions, waitForOptions);
    });
  });

  describe('Posting Articles', () => {
    test('[5] Submit button disabled initially', async () => {
      await loginFlow();
      expect(submitArticleBtn()).toBeDisabled();
    });

    test('[6] Posting a new article works and resets form', async () => {
      await loginFlow();
      fireEvent.change(titleInput(), { target: { value: 'Fancy Title' } });
      fireEvent.change(textInput(), { target: { value: 'Fancy text' } });
      fireEvent.change(topicSelect(), { target: { value: 'React' } });
      fireEvent.click(submitArticleBtn());
      await screen.findByText('Fancy Title', queryOptions, waitForOptions);
      expect(titleInput()).toHaveValue('');
      expect(textInput()).toHaveValue('');
    });
  });

  describe('Editing Articles', () => {
    test('[7] Edit button populates form with article data', async () => {
      await loginFlow();
      fireEvent.click(screen.getAllByText('Edit')[0]);
      expect(titleInput()).toHaveValue(st.closuresTitle);
    });

    test('[8] Editing an article updates it and clears form', async () => {
      await loginFlow();
      fireEvent.click(screen.getAllByText('Edit')[0]);
      fireEvent.change(titleInput(), { target: { value: 'Fancy Title' } });
      fireEvent.click(submitArticleBtn());
      await screen.findByText('Fancy Title', queryOptions, waitForOptions);
    });
  });

  describe('Deleting Articles', () => {
    test('[9] Delete button removes article', async () => {
      await loginFlow();
      fireEvent.click(screen.getAllByText('Delete')[0]);
      await waitForElementToBeRemoved(() => screen.queryByText(st.closuresTitle, queryOptions));
    });
  });
});
