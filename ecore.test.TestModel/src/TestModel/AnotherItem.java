/**
 */
package TestModel;


/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Another Item</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link TestModel.AnotherItem#isTest <em>Test</em>}</li>
 * </ul>
 *
 * @see TestModel.TestModelPackage#getAnotherItem()
 * @model
 * @generated
 */
public interface AnotherItem extends Item {
	/**
	 * Returns the value of the '<em><b>Test</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <p>
	 * If the meaning of the '<em>Test</em>' attribute isn't clear,
	 * there really should be more of a description here...
	 * </p>
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Test</em>' attribute.
	 * @see #setTest(boolean)
	 * @see TestModel.TestModelPackage#getAnotherItem_Test()
	 * @model
	 * @generated
	 */
	boolean isTest();

	/**
	 * Sets the value of the '{@link TestModel.AnotherItem#isTest <em>Test</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Test</em>' attribute.
	 * @see #isTest()
	 * @generated
	 */
	void setTest(boolean value);

} // AnotherItem
