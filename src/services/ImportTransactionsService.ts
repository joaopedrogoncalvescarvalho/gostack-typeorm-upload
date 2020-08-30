import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import upload from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';
import transactionsRouter from '../routes/transactions.routes';

interface ImportFile {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: ImportFile): Promise<Transaction[]> {
    const csvFilePath = path.resolve(upload.directory, filename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
      skip_empty_lines: true,
      skip_lines_with_error: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Array<string> = [];

    parseCSV.on('data', async line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Array<Transaction> = [];

    for (const line of lines) {
      const title = line[0];
      const type = line[1];
      const value = line[2];
      const category = line[3];

      const createTransactionService = new CreateTransactionService();

      const transaction = await createTransactionService.execute({
        title,
        type: type === 'income' ? 'income' : 'outcome',
        value: Number(value),
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
