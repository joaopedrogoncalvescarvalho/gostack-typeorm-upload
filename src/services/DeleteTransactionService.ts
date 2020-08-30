import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const existTransation = await transactionsRepository.find({
      where: { id },
    });

    if (!existTransation) throw new AppError('Transaction not exist');

    await transactionsRepository.delete({ id });
  }
}

export default DeleteTransactionService;
