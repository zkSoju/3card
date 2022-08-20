import { Frequency } from "scan-helper";
import AWS from 'aws-sdk';

// console.log(process.env.AWS_ACCESS_KEY_ID)
// console.log(process.env.AWS_SECRET_ACCESS_KEY)

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

export const TABLE_NAME = 'lens-rec-table';

export const TABLE_SIZE = 3000;

export type RecResult = {
    account: string,
    ranking: Frequency[],
};

export type CheckResult = {
    account: string,
    ifDrawable: boolean,
    ranking: Frequency[],
    lastestRec?: RecResult,
};

export const getCorrelation = (
    ranking1: Frequency[],
    ranking2: Frequency[])
    : number => {
    return ranking2.length;
};