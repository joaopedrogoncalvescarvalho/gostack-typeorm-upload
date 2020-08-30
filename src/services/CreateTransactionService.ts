import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const categoryRepository = getRepository(Category);

    let categoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const transactions = await transactionsRepository.find();

      const { total } = transactionsRepository.getBalance(transactions);

      if (total < value) throw new AppError('Insufficient funds');
    }

    if (!categoryExist) {
      const createCategoryService = new CreateCategoryService();

      categoryExist = await createCategoryService.execute({ title: category });
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryExist.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
