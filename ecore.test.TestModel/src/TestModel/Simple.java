/**
 */
package TestModel;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Simple</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link TestModel.Simple#getName <em>Name</em>}</li>
 *   <li>{@link TestModel.Simple#getInfo <em>Info</em>}</li>
 *   <li>{@link TestModel.Simple#getNewString <em>New String</em>}</li>
 * </ul>
 *
 * @see TestModel.TestModelPackage#getSimple()
 * @model
 * @generated
 */
public interface Simple extends EObject {
	/**
	 * Returns the value of the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Name</em>' attribute isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Name</em>' attribute.
	 * @see #setName(String)
	 * @see TestModel.TestModelPackage#getSimple_Name()
	 * @model
	 * @generated
	 */
	String getName();

	/**
	 * Sets the value of the '{@link TestModel.Simple#getName <em>Name</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Name</em>' attribute.
	 * @see #getName()
	 * @generated
	 */
	void setName(String value);

	/**
	 * Returns the value of the '<em><b>Info</b></em>' containment reference list.
	 * The list contents are of type {@link TestModel.Info}.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Info</em>' containment reference list isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Info</em>' containment reference list.
	 * @see TestModel.TestModelPackage#getSimple_Info()
	 * @model containment="true"
	 * @generated
	 */
	EList<Info> getInfo();

	/**
	 * Returns the value of the '<em><b>New String</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>New String</em>' attribute isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>New String</em>' attribute.
	 * @see #setNewString(String)
	 * @see TestModel.TestModelPackage#getSimple_NewString()
	 * @model dataType="TestModel.String" ordered="false"
	 *        extendedMetaData="kind='element' namespace='' processing='strict'"
	 * @generated
	 */
	String getNewString();

	/**
	 * Sets the value of the '{@link TestModel.Simple#getNewString <em>New String</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>New String</em>' attribute.
	 * @see #getNewString()
	 * @generated
	 */
	void setNewString(String value);

} // Simple
