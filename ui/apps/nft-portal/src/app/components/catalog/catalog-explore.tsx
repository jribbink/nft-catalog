import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getAllCollections,
  getAllProposals,
} from '../../../flow/utils';
import { Network } from './network-dropdown';
import { changeFCLEnvironment } from '../../../flow/setup';
import { Badge } from '../shared/badge';

export function CatalogExplore({
  network,
  type,
  userAddress = null,
}: {
  search: string;
  type: 'Catalog' | 'Proposals' | 'NFTs' | 'Transactions';
  network: Network;
  selected: string | undefined;
  userAddress?: string | null;
  collectionIdentifier?: string | null;
  ftVault?: string | null;
}) {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<null | Array<any>>(null);
  const loading = !items;

  useEffect(() => {
    const setup = async () => {
      changeFCLEnvironment(network);
      let collections: [any]|[] = []
      if (type === 'Catalog') {
        collections = (await getAllCollections()) || [];
      } else if (type === 'Proposals') {
        collections = (await getAllProposals()) || [];
      }
      const items = Object.keys(collections).map((catalogKey: any) => {
        const catalog = collections[catalogKey];
        return {
          name: `${catalog.metadata ? catalog.collectionIdentifier : catalogKey}`,
          subtext: `${catalog.metadata ? catalog.metadata.nftType.typeID : catalog.nftType.typeID}`,
          id: catalogKey,
          status: catalog.status,
        };
      });
      setItems(items);
    };
    setup();
  }, [network, userAddress]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-6 mt-8">
        {items &&
          items.length > 0 &&
          items.map((item, i) => {
            return <CatalogItem key={i} item={item} network={network} />;
          })}
      </div>

      {loading &&
        [0, 0, 0, 0, 0, 0, 0, 0, 0].map((item, i) => {
          return (
            <div key={i} className={`flex-col p-8 cursor-pointer border-t-2`}>
              <div className="font-semibold"> </div>
              <div className=""> </div>
            </div>
          );
        })}
      {items != null && items.length === 0 && (
        <div className={`flex-col p-8 cursor-pointer border-t-2`}>
          <div className="font-semibold">No Items</div>
          <div className=""> </div>
        </div>
      )}
    </div>
  );
}

export function CatalogItem(props: any) {
  const item = props.item;
  const network = props.network;
  const readableStatus = item.status === 'IN_REVIEW' ? 'In Review' : item.status === 'APPROVED' ? 'Approved' : 'Rejected'
  return (
    <a className="w-full h-full border-2 rounded-2xl p-6 flex flex-col bg-white cursor-pointer" href={network === 'Catalog' ? `/catalog/${network}/${item.name}` : `/proposals/${network}/${item.id}`}>
      <header className="font-display font-semibold text-xl truncate hover:text-clip">{item.name}</header>
      <div className="whitespace-pre text-xs h-16 pt-3.5">{item.subtext}</div>
      <div className="grow"></div>
      <div className="flex flex-row font-semibold text-sm gap-2">
        <a target="_blank" href={`https://${network === "testnet" ? 'testnet.' : ''}flowscan.org/contract/${item.subtext.replace(/.NFT$/, '')}`} className="flex flex-row rounded bg-primary-gray-50 px-2 py-1 border-2" style={{width: 'fit-content'}}>
          <svg width="12" height="14" className="mt-1 mr-2" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.05798 5.63057L12 3.84713L5.61546 0L0 3.3758V10.1401L6.38454 14V10.7771L12 7.38853L9.05798 5.63057ZM4.84639 11.1847L1.55035 9.19745V4.30573L5.61546 1.85987L8.89929 3.83439L4.84639 6.28026V11.1847ZM6.39674 7.23567L7.50763 6.56051L8.89929 7.38853L6.39674 8.9172V7.23567Z" fill="black"/>
          </svg>
          View Contract
        </a>
        {item.status && (
          <Badge
            color={
              item.status === 'IN_REVIEW'
                ? 'blue'
                : item.status === 'APPROVED'
                ? 'green'
                : 'red'
            }
            text={readableStatus}
          />
        )}
      </div>
    </a>
  )
}
