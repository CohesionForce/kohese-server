/**
 */
package KoheseTypes.impl;

import KoheseTypes.Item;
import KoheseTypes.Journal;
import KoheseTypes.KoheseTypesPackage;
import KoheseTypes.Workflow;

import java.util.Collection;

import org.eclipse.emf.common.notify.Notification;
import org.eclipse.emf.common.notify.NotificationChain;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.impl.ENotificationImpl;
import org.eclipse.emf.ecore.impl.MinimalEObjectImpl;

import org.eclipse.emf.ecore.util.EObjectContainmentEList;
import org.eclipse.emf.ecore.util.EObjectResolvingEList;
import org.eclipse.emf.ecore.util.InternalEList;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>Item</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link KoheseTypes.impl.ItemImpl#getJournal <em>Journal</em>}</li>
 *   <li>{@link KoheseTypes.impl.ItemImpl#getItem <em>Item</em>}</li>
 *   <li>{@link KoheseTypes.impl.ItemImpl#getWorkflow <em>Workflow</em>}</li>
 * </ul>
 *
 * @generated
 */
public class ItemImpl extends MinimalEObjectImpl.Container implements Item {
	/**
	 * The cached value of the '{@link #getJournal() <em>Journal</em>}' containment reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getJournal()
	 * @generated
	 * @ordered
	 */
	protected Journal journal;

	/**
	 * The cached value of the '{@link #getItem() <em>Item</em>}' reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getItem()
	 * @generated
	 * @ordered
	 */
	protected EList<Item> item;

	/**
	 * The cached value of the '{@link #getWorkflow() <em>Workflow</em>}' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getWorkflow()
	 * @generated
	 * @ordered
	 */
	protected EList<Workflow> workflow;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected ItemImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return KoheseTypesPackage.Literals.ITEM;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public Journal getJournal() {
		return journal;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public NotificationChain basicSetJournal(Journal newJournal, NotificationChain msgs) {
		Journal oldJournal = journal;
		journal = newJournal;
		if (eNotificationRequired()) {
			ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, KoheseTypesPackage.ITEM__JOURNAL, oldJournal, newJournal);
			if (msgs == null) msgs = notification; else msgs.add(notification);
		}
		return msgs;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setJournal(Journal newJournal) {
		if (newJournal != journal) {
			NotificationChain msgs = null;
			if (journal != null)
				msgs = ((InternalEObject)journal).eInverseRemove(this, EOPPOSITE_FEATURE_BASE - KoheseTypesPackage.ITEM__JOURNAL, null, msgs);
			if (newJournal != null)
				msgs = ((InternalEObject)newJournal).eInverseAdd(this, EOPPOSITE_FEATURE_BASE - KoheseTypesPackage.ITEM__JOURNAL, null, msgs);
			msgs = basicSetJournal(newJournal, msgs);
			if (msgs != null) msgs.dispatch();
		}
		else if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, KoheseTypesPackage.ITEM__JOURNAL, newJournal, newJournal));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public EList<Item> getItem() {
		if (item == null) {
			item = new EObjectResolvingEList<Item>(Item.class, this, KoheseTypesPackage.ITEM__ITEM);
		}
		return item;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public EList<Workflow> getWorkflow() {
		if (workflow == null) {
			workflow = new EObjectContainmentEList<Workflow>(Workflow.class, this, KoheseTypesPackage.ITEM__WORKFLOW);
		}
		return workflow;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationChain msgs) {
		switch (featureID) {
			case KoheseTypesPackage.ITEM__JOURNAL:
				return basicSetJournal(null, msgs);
			case KoheseTypesPackage.ITEM__WORKFLOW:
				return ((InternalEList<?>)getWorkflow()).basicRemove(otherEnd, msgs);
		}
		return super.eInverseRemove(otherEnd, featureID, msgs);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public Object eGet(int featureID, boolean resolve, boolean coreType) {
		switch (featureID) {
			case KoheseTypesPackage.ITEM__JOURNAL:
				return getJournal();
			case KoheseTypesPackage.ITEM__ITEM:
				return getItem();
			case KoheseTypesPackage.ITEM__WORKFLOW:
				return getWorkflow();
		}
		return super.eGet(featureID, resolve, coreType);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@SuppressWarnings("unchecked")
	@Override
	public void eSet(int featureID, Object newValue) {
		switch (featureID) {
			case KoheseTypesPackage.ITEM__JOURNAL:
				setJournal((Journal)newValue);
				return;
			case KoheseTypesPackage.ITEM__ITEM:
				getItem().clear();
				getItem().addAll((Collection<? extends Item>)newValue);
				return;
			case KoheseTypesPackage.ITEM__WORKFLOW:
				getWorkflow().clear();
				getWorkflow().addAll((Collection<? extends Workflow>)newValue);
				return;
		}
		super.eSet(featureID, newValue);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void eUnset(int featureID) {
		switch (featureID) {
			case KoheseTypesPackage.ITEM__JOURNAL:
				setJournal((Journal)null);
				return;
			case KoheseTypesPackage.ITEM__ITEM:
				getItem().clear();
				return;
			case KoheseTypesPackage.ITEM__WORKFLOW:
				getWorkflow().clear();
				return;
		}
		super.eUnset(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public boolean eIsSet(int featureID) {
		switch (featureID) {
			case KoheseTypesPackage.ITEM__JOURNAL:
				return journal != null;
			case KoheseTypesPackage.ITEM__ITEM:
				return item != null && !item.isEmpty();
			case KoheseTypesPackage.ITEM__WORKFLOW:
				return workflow != null && !workflow.isEmpty();
		}
		return super.eIsSet(featureID);
	}

} //ItemImpl
