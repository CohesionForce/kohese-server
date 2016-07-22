/**
 */
package KoheseModel;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Journal</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link KoheseModel.Journal#getObservation <em>Observation</em>}</li>
 * </ul>
 *
 * @see KoheseModel.KoheseModelPackage#getJournal()
 * @model
 * @generated
 */
public interface Journal extends EObject {
	/**
	 * Returns the value of the '<em><b>Observation</b></em>' reference list.
	 * The list contents are of type {@link KoheseModel.Observation}.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Observation</em>' reference list isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Observation</em>' reference list.
	 * @see KoheseModel.KoheseModelPackage#getJournal_Observation()
	 * @model
	 * @generated
	 */
	EList<Observation> getObservation();

} // Journal
