type Category = {
  id: string;
  name: string;
};

const CATEGORY_DETAILS: Category[] = [
  {
    id: 'cmomkrd3h0000w8rbsbcqpdmz',
    name: 'Access Equipment'
  },
  {
    id: 'cmomksfh70001w8rb2od369ix',
    name: 'Heavy Machinary'
  },
  {
    id: 'cmomkszph0002w8rbl3g5d7gg',
    name: 'Essential Tools'
  },
  {
    id: 'cmomku4mi0003w8rb7galb65a',
    name: 'Power Tools'
  }
];

export function getCategoryFromId({
  categoryId
}: {
  categoryId: string;
}): string {
  const category = CATEGORY_DETAILS.find((cat) => cat.id === categoryId);

  if (category && category.name) {
    return category.name;
  }

  return 'Unknown';
}

