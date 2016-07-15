/**
 */
package KoheseTypes;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Item</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link KoheseTypes.Item#getJournal <em>Journal</em>}</li>
 *   <li>{@link KoheseTypes.Item#getItem <em>Item</em>}</li>
 *   <li>{@link KoheseTypes.Item#getWorkflow <em>Workflow</em>}</li>
 * </ul>
 *
 * @see KoheseTypes.KoheseTypesPackage#getItem()
 * @model
 * @generated
 */
public interface Item extends EObject {
	/**
	 * Returns the value of the '<em><b>Journal</b></em>' containment reference.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Journal</em>' containment reference isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Journal</em>' containment reference.
	 * @see #setJournal(Journal)
	 * @see KoheseTypes.KoheseTypesPackage#getItem_Journal()
	 * @model containment="true" required="true"
	 * @generated
	 */
	Journal getJournal();

	/**
	 * Sets the value of the '{@link KoheseTypes.Item#getJournal <em>Journal</em>}' containment reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Journal</em>' containment reference.
	 * @see #getJournal()
	 * @generated
	 */
	void setJournal(Journal value);

	/**
	 * Returns the value of the '<em><b>Item</b></em>' reference list.
	 * The list contents are of type {@link KoheseTypes.Item}.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Item</em>' containment reference list isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Item</em>' reference list.
	 * @see KoheseTypes.KoheseTypesPackage#getItem_Item()
	 * @model
	 * @generated
	 */
	EList<Item> getItem();

	/**
	 * Returns the value of the '<em><b>Workflow</b></em>' containment reference list.
	 * The list contents are of type {@link KoheseTypes.Workflow}.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Workflow</em>' containment reference list isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Workflow</em>' containment reference list.
	 * @see KoheseTypes.KoheseTypesPackage#getItem_Workflow()
	 * @model containment="true"
	 * @generated
	 */
	EList<Workflow> getWorkflow();

} // Item
