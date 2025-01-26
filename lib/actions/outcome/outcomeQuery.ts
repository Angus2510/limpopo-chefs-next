import prisma from '@/lib/db';
import { type GetOutcomeSchema } from '@/types/outcome/outcome';

export const getOutcomeData = async (input: GetOutcomeSchema) => {
  const {
    page = 1,
    per_page = 10,
    sort = 'title.asc',
    search,
    type,
    hidden,
  } = input;

  const offset = (page - 1) * per_page;
  const [sortColumn, sortOrder] = sort.split('.') as [string, 'asc' | 'desc'];

  if (!sortColumn || !sortOrder) {
    throw new Error('Invalid sort parameter');
  }

  const whereConditions: any = {};

  // Split search query into terms and search across multiple fields
  if (search) {
    const searchTerms = search.split(' ');
    whereConditions.AND = searchTerms.map((term) => ({
      OR: [
        {
          title: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          type: {
            contains: term,
            mode: 'insensitive',
          },
        },
      ],
    }));
  }

  if (type) {
    whereConditions.type = {
      contains: type,
      mode: 'insensitive',
    };
  }

  let orderByCondition = {};

  orderByCondition = { [sortColumn]: sortOrder };

  const data = await prisma.outcome.findMany({
    where: whereConditions,
    select: {
      id: true,
      title: true,
      type: true,
      hidden: true,
    },
    skip: offset,
    take: per_page,
    orderBy: orderByCondition,
  });

  const totalOutcome = await prisma.outcome.count({
    where: whereConditions,
  });

  const pageCount = Math.ceil(totalOutcome / per_page);

  const outcome = data.map((outcome) => ({
    id: outcome.id,
    title: outcome.title,
    type: outcome.type,
    hidden: outcome.hidden,
  }));

  return { outcome, pageCount };
};
