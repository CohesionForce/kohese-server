/**
 */
package KoheseTypes;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Workflow</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link KoheseTypes.Workflow#getAssignment <em>Assignment</em>}</li>
 * </ul>
 *
 * @see KoheseTypes.KoheseTypesPackage#getWorkflow()
 * @model
 * @generated
 */
public interface Workflow extends Item {
	/**
	 * Returns the value of the '<em><b>Assignment</b></em>' containment reference list.
	 * The list contents are of type {@link KoheseTypes.Assignment}.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Assignment</em>' containment reference list isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Assignment</em>' containment reference list.
	 * @see KoheseTypes.KoheseTypesPackage#getWorkflow_Assignment()
	 * @model containment="true"
	 * @generated
	 */
	EList<Assignment> getAssignment();

} // Workflow
