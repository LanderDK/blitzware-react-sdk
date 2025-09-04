# BlitzWare React Role Check Example

This example demonstrates how to implement role-based access control in a React application using the BlitzWare React SDK.

## Features

- **Role Checking**: Uses the `useHasRole` hook to check if the current user has specific roles
- **Conditional Rendering**: Shows/hides content based on user roles
- **Admin Section**: Content only visible to users with the "admin" role
- **Premium Section**: Content only visible to users with the "premium" role
- **Role Status Display**: Visual indicators showing which roles the user has

## Key Components

### useHasRole Hook
```jsx
const hasAdminRole = useHasRole("admin");
const hasPremiumRole = useHasRole("premium");
```

### Conditional Rendering
```jsx
{hasAdminRole && (
  <div className="admin-section">
    <h3>🔒 Admin Only Section</h3>
    <p>This content is only visible to users with the admin role.</p>
  </div>
)}
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Navigate to `http://localhost:3000` to see the example in action.

## Usage

1. Log in using the BlitzWare authentication system
2. Observe the role status indicators showing which roles you have
3. See how content is conditionally displayed based on your roles
4. Try logging in with different users that have different roles to see the changes

## Role Configuration

The example checks for two roles:
- `admin`: Provides access to administrative features
- `premium`: Provides access to premium features

Users can have one, both, or neither of these roles, and the UI will adapt accordingly.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
