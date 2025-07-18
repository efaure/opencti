import makeStyles from '@mui/styles/makeStyles';
import Alert from '@mui/material/Alert';
import React, { useContext } from 'react';
import IngestionMenu from '@components/data/IngestionMenu';
import IngestionCsvLines, { ingestionCsvLinesQuery } from '@components/data/ingestionCsv/IngestionCsvLines';
import { IngestionCsvLinesPaginationQuery, IngestionCsvLinesPaginationQuery$variables } from '@components/data/ingestionCsv/__generated__/IngestionCsvLinesPaginationQuery.graphql';
import { IngestionCsvLineDummy } from '@components/data/ingestionCsv/IngestionCsvLine';
import { IngestionCsvCreationContainer } from '@components/data/ingestionCsv/IngestionCsvCreation';
import IngestionCsvImport from '@components/data/ingestionCsv/IngestionCsvImport';
import { useFormatter } from '../../../components/i18n';
import useAuth, { UserContext } from '../../../utils/hooks/useAuth';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import { INGESTION_MANAGER } from '../../../utils/platformModulesHelper';
import ListLines from '../../../components/list_lines/ListLines';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { INGESTION_SETINGESTIONS } from '../../../utils/hooks/useGranted';
import Security from '../../../utils/Security';
import Breadcrumbs from '../../../components/Breadcrumbs';
import useConnectedDocumentModifier from '../../../utils/hooks/useConnectedDocumentModifier';
import { isNotEmptyField } from '../../../utils/utils';
import GradientButton from '../../../components/GradientButton';

const LOCAL_STORAGE_KEY = 'ingestionCsvs';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
}));

const IngestionCsv = () => {
  const classes = useStyles();
  const { settings } = useContext(UserContext);
  const importFromHubUrl = isNotEmptyField(settings?.platform_xtmhub_url)
    ? `${settings.platform_xtmhub_url}/redirect/octi_integration_feeds?octi_instance_id=${settings.id}`
    : '';

  const { t_i18n } = useFormatter();
  const { setTitle } = useConnectedDocumentModifier();
  setTitle(t_i18n('CSV Feeds | Ingestion | Data'));
  const { platformModuleHelpers } = useAuth();
  const {
    viewStorage,
    paginationOptions,
    helpers,
  } = usePaginationLocalStorage<IngestionCsvLinesPaginationQuery$variables>(LOCAL_STORAGE_KEY, {
    sortBy: 'name',
    orderAsc: false,
    searchTerm: '',
    numberOfElements: {
      number: 0,
      symbol: '',
    },
  });

  const renderLines = () => {
    const { searchTerm, sortBy, orderAsc, numberOfElements } = viewStorage;
    const dataColumns = {
      name: {
        label: 'Name',
        width: '20%',
        isSortable: true,
      },
      uri: {
        label: 'URL',
        width: '25%',
        isSortable: true,
      },
      ingestion_running: {
        label: 'Status',
        width: '15%',
        isSortable: false,
      },
      last_execution_date: {
        label: 'Last run',
        width: '15%',
        isSortable: false,
      },
      current_state_hash: {
        label: 'Current state',
        isSortable: false,
        width: '15%',
      },
    };
    const queryRef = useQueryLoading<IngestionCsvLinesPaginationQuery>(
      ingestionCsvLinesQuery,
      paginationOptions,
    );
    return (
      <ListLines
        helpers={helpers}
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={helpers.handleSort}
        handleSearch={helpers.handleSearch}
        displayImport={false}
        secondaryAction={true}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        keyword={searchTerm}
        createButton={
          <Security needs={[INGESTION_SETINGESTIONS]}>
            <>
              <IngestionCsvImport
                paginationOptions={paginationOptions}
              />
              {isNotEmptyField(importFromHubUrl) && (
                <GradientButton
                  size="small"
                  sx={{ marginLeft: 1 }}
                  href={importFromHubUrl}
                  target="_blank"
                  title={t_i18n('Import from Hub')}
                >
                  {t_i18n('Import from Hub')}
                </GradientButton>
              )}
              <IngestionCsvCreationContainer
                paginationOptions={paginationOptions}
                drawerSettings={
                {
                  title: t_i18n('Create a CSV Feed'),
                  button: t_i18n('Create'),
                }
                }
              />
            </>
          </Security>
        }
      >
        {queryRef && (
          <React.Suspense
            fallback={
              <>
                {Array(20)
                  .fill(0)
                  .map((_, idx) => (
                    <IngestionCsvLineDummy key={idx} dataColumns={dataColumns} />
                  ))}
              </>
            }
          >
            <IngestionCsvLines
              queryRef={queryRef}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              setNumberOfElements={helpers.handleSetNumberOfElements}
            />
          </React.Suspense>
        )}
      </ListLines>
    );
  };
  if (!platformModuleHelpers.isIngestionManagerEnable()) {
    return (
      <div className={classes.container}>
        <Alert severity="info">
          {t_i18n(platformModuleHelpers.generateDisableMessage(INGESTION_MANAGER))}
        </Alert>
        <IngestionMenu/>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Breadcrumbs elements={[{ label: t_i18n('Data') }, { label: t_i18n('Ingestion') }, { label: t_i18n('CSV feeds'), current: true }]} />
      <IngestionMenu/>
      {renderLines()}
    </div>
  );
};

export default IngestionCsv;
