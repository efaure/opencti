import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { FormikConfig } from 'formik/dist/types';
import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import * as Yup from 'yup';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import { useFormatter } from '../../../../components/i18n';
import MarkdownField from '../../../../components/fields/MarkdownField';
import TextField from '../../../../components/TextField';
import type { Theme } from '../../../../components/Theme';
import { handleErrorInForm } from '../../../../relay/environment';
import { FieldOption, fieldSpacingContainerStyle } from '../../../../utils/field';
import { useDynamicSchemaEditionValidation, useIsMandatoryAttribute, yupShapeConditionalRequired } from '../../../../utils/hooks/useEntitySettings';
import { insertNode } from '../../../../utils/store';
import ObjectAssigneeField from '../../common/form/ObjectAssigneeField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import { CaseTasksLinesQuery$variables } from './__generated__/CaseTasksLinesQuery.graphql';
import ObjectParticipantField from '../../common/form/ObjectParticipantField';
import useApiMutation from '../../../../utils/hooks/useApiMutation';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>((theme) => ({
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const caseTaskAddMutation = graphql`
  mutation CaseTaskCreationMutation($input: TaskAddInput!) {
    taskAdd(input: $input) {
      ...CaseUtilsTasksLine_data
    }
  }
`;

const TASK_TYPE = 'Task';
interface FormikCaseTaskAddInput {
  name: string;
  due_date?: Date | null;
  description?: string;
  objectAssignee?: FieldOption[];
  objectParticipant: FieldOption[];
  objectLabel?: FieldOption[];
  objectMarking: FieldOption[];
}

interface CaseTaskCreationProps {
  caseId: string;
  onClose: () => void;
  paginationOptions: CaseTasksLinesQuery$variables;
  defaultMarkings?: { value: string; label: string }[];
}

const CaseTaskCreation: FunctionComponent<CaseTaskCreationProps> = ({
  caseId,
  onClose,
  paginationOptions,
  defaultMarkings,
}) => {
  const { t_i18n } = useFormatter();
  const classes = useStyles();

  const { mandatoryAttributes } = useIsMandatoryAttribute(
    TASK_TYPE,
  );
  const basicShape = yupShapeConditionalRequired({
    name: Yup.string().trim().min(2),
    description: Yup.string().nullable().max(5000, t_i18n('The value is too long')),
    due_date: Yup.date().nullable(),
    objectLabel: Yup.array(),
    objectMarking: Yup.array(),
    objectAssignee: Yup.array(),
    objectParticipant: Yup.array(),
    x_opencti_workflow_id: Yup.object(),
  }, mandatoryAttributes);
  const validator = useDynamicSchemaEditionValidation(mandatoryAttributes, basicShape);

  const [addTask] = useApiMutation(
    caseTaskAddMutation,
    undefined,
    { successMessage: `${t_i18n('entity_Task')} ${t_i18n('successfully created')}` },
  );

  const onSubmit: FormikConfig<FormikCaseTaskAddInput>['onSubmit'] = (
    values,
    { setSubmitting, resetForm, setErrors },
  ) => {
    setSubmitting(true);

    addTask({
      variables: {
        input: {
          ...values,
          objectAssignee: (values.objectAssignee ?? []).map(
            ({ value }) => value,
          ),
          objectParticipant: values.objectParticipant.map(({ value }) => value),
          objectLabel: (values.objectLabel ?? []).map(({ value }) => value),
          objectMarking: (values.objectMarking ?? []).map(({ value }) => value),
          objects: [caseId],
        },
      },
      updater: (store: RecordSourceSelectorProxy) => insertNode(store, 'Pagination_tasks', paginationOptions, 'taskAdd'),
      onError: (error: Error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        onClose();
      },
    });
  };
  return (
    <Formik<FormikCaseTaskAddInput>
      initialValues={{
        name: '',
        description: '',
        due_date: null,
        objectAssignee: [],
        objectParticipant: [],
        objectMarking: defaultMarkings ?? [],
      }}
      onSubmit={onSubmit}
      onReset={onClose}
      validationSchema={validator}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {({ isSubmitting, handleReset, submitForm, setFieldValue }) => (
        <Form>
          <Field
            style={{ marginBottom: 20 }}
            component={TextField}
            variant="standard"
            name="name"
            label={t_i18n('Name')}
            required={(mandatoryAttributes.includes('name'))}
            fullWidth
          />
          <Field
            component={DateTimePickerField}
            name="due_date"
            textFieldProps={{
              label: t_i18n('Due Date'),
              variant: 'standard',
              fullWidth: true,
            }}
          />
          <ObjectAssigneeField
            name="objectAssignee"
            required={(mandatoryAttributes.includes('objectAssignee'))}
            style={fieldSpacingContainerStyle}
          />
          <ObjectParticipantField
            name="objectParticipant"
            required={(mandatoryAttributes.includes('objectParticipant'))}
            style={fieldSpacingContainerStyle}
          />
          <ObjectLabelField
            name="objectLabel"
            required={(mandatoryAttributes.includes('objectLabel'))}
            style={fieldSpacingContainerStyle}
          />
          <ObjectMarkingField
            name="objectMarking"
            required={(mandatoryAttributes.includes('objectMarking'))}
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t_i18n('Description')}
            required={(mandatoryAttributes.includes('description'))}
            fullWidth
            multiline
            rows="4"
            style={fieldSpacingContainerStyle}
          />
          <div className={classes.buttons}>
            <Button
              onClick={handleReset}
              disabled={isSubmitting}
              variant="contained"
              classes={{ root: classes.button }}
            >
              {t_i18n('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={submitForm}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t_i18n('Create')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CaseTaskCreation;
