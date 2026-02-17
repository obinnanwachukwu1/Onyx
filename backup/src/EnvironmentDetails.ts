const details = {
  name: 'Onyx',
  version_major: '2',
  version_minor: '0',
  release_channel: 'stable',
} as const;

export type EnvironmentDetails = typeof details;

export default details;
