export const awsConfig = {
  region: 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  queueUrl: process.env.SQS_QUEUE_URL,
};
