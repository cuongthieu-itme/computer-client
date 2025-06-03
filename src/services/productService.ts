import { ComputerProductDTO, computerProducts } from '@/data/computerProducts';

export const fetchComputerProducts = async (): Promise<ComputerProductDTO[]> => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(computerProducts);
      }, 500);
    });
  } catch (error) {
    console.error('Error fetching computer products:', error);
    throw new Error('Failed to fetch computer products');
  }
};
