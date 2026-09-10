const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAdmin = {
  email: 'admin@mediguide.com',
  password: 'admin123',
};

export async function loginUser({ email, password }) {
  await delay();

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  return {
    success: true,
    userName: 'Deepa',
    email,
    message: 'Login successful.',
  };
}

export async function registerUser({ fullName, email, password, phone }) {
  await delay();

  if (!fullName || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  return {
    success: true,
    message: 'Account created successfully.',
    user: {
      fullName,
      email,
      phone,
    },
  };
}

export async function adminLogin({ email, password }) {
  await delay();

  if (email !== mockAdmin.email || password !== mockAdmin.password) {
    throw new Error('Invalid admin credentials.');
  }

  return {
    success: true,
    message: 'Admin login successful.',
  };
}

export async function searchSymptoms(query) {
  await delay();

  if (!query || !query.trim()) {
    return {
      success: false,
      message: 'Please provide symptoms to search.',
      results: [],
    };
  }

  return {
    success: true,
    query,
    results: [
      {
        title: 'Possible flu-like illness',
        description: 'Your symptoms may match a mild viral infection.',
      },
      {
        title: 'Common headache',
        description: 'Take rest, stay hydrated, and monitor your temperature.',
      },
    ],
  };
}

export default {
  loginUser,
  registerUser,
  adminLogin,
  searchSymptoms,
};
